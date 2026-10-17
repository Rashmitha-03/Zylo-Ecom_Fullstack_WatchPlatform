import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  finalizeOrder,
  finalizeCartOnlineOrder,
  getAddressesByAddressId
} from '../services/serviceapi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
 
function FinalizeOrder() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceRef = useRef();
 
  const [order, setOrder] = useState(null);
  const [addressData, setAddressData] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const key = `payment-finalized-${paymentId}`;
    if (sessionStorage.getItem(key)) {
      setLoading(false);
      return;
    }
 
    const orderType = location.state?.orderType;
    const apiCall =
      orderType === 'cart'
        ? finalizeCartOnlineOrder(paymentId)
        : finalizeOrder(paymentId);
 
    apiCall
      .then(res => {
        const details = res.data.orderDetails || res.data;
        sessionStorage.setItem(key, 'true');
        setOrder(details);
 
        if (details.addressId) {
          getAddressesByAddressId(details.addressId)
            .then(r => setAddressData(r.data))
            .catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [paymentId, location.state]);
 
  const downloadInvoice = async () => {
    if (!order) return;
 
    const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
 
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
    pdf.save(`Invoice_${order.orderId || paymentId}.pdf`);
  };
 
  if (loading) {
    return (
      <p className="text-center mt-4">Finalizing Order… Please wait.</p>
    );
  }
 
  if (!order) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          Failed to load order details. Please try again.
        </div>
        <div className="d-flex justify-content-center">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }
 
  return (
    <>
      <div className="container" style={{ marginTop: '7.5rem', fontFamily: 'Georgia, serif' }}>
        <h2>Order Summary</h2>
        <ul className="list-group mb-3">
          <li className="list-group-item"><strong>Order ID:</strong> {order.orderId}</li>
          <li className="list-group-item"><strong>Payment ID:</strong> {order.paymentId}</li>
          {order.products?.length ? (
            <li className="list-group-item">
              <strong>Products:</strong>
              <ul>
                {order.products.map(p => (
                  <li key={p.productId}>{p.productName}</li>
                ))}
              </ul>
            </li>
          ) : (
            <li className="list-group-item"><strong>Product:</strong> {order.productName}</li>
          )}
          <li className="list-group-item"><strong>Total Quantity:</strong> {order.quantity}</li>
          <li className="list-group-item"><strong>Total Price:</strong> ₹{order.totalPrice}</li>
          <li className="list-group-item"><strong>Payment Status:</strong> {order.paymentStatus}</li>
          <li className="list-group-item"><strong>Order Status:</strong> {order.orderStatus}</li>
          <li className="list-group-item">
            <strong>Shipping Address:</strong><br />
            {addressData ? (
              <>
                {addressData.street}, {addressData.city}, {addressData.state} – {addressData.postalCode}, {addressData.country}
              </>
            ) : 'Address not available'}
          </li>
          <li className="list-group-item"><strong>UPI ID:</strong> {order.upiId || 'N/A'}</li>
          <li className="list-group-item">
            <strong>Order Time:</strong> {order.orderTime ? new Date(order.orderTime).toLocaleString() : new Intl.DateTimeFormat('en-IN', {dateStyle: 'medium',timeStyle: 'short',timeZone: 'Asia/Kolkata'}).format(new Date())}
          </li>
        </ul>
 
        <div className="d-flex gap-3 mt-3">
          <button
            className="btn"
            style={{
              backgroundColor: '#B57B5B',
              color: 'white',
              border: '1px solid #B57B5B'
            }}
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
 
          <button
            className="btn"
            style={{
              border: '1px solid #B57B5B',
              backgroundColor: 'transparent',
              color: 'black'
            }}
            onClick={downloadInvoice}
          >
            Download Invoice
          </button>
        </div>
      </div>
 
      {/* Hidden invoice markup for PDF generation */}
      <div
        ref={invoiceRef}
        style={{
          position: 'absolute',
          top: 0,
          left: -9999,
          width: 600,
          padding: 20,
          background: '#fff',
          fontFamily: 'Arial, sans-serif',
          color: '#333'
        }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: 20 }}>ORDER INVOICE</h1>
        <div style={{ marginBottom: 20 }}>
          <div><strong>Date:</strong> {new Date().toLocaleString()}</div>
          <div><strong>Order ID:</strong> {order.orderId}</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Field</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Payment ID', order.paymentId],
              ['Payment Status', order.paymentStatus],
              ['Order Status', order.orderStatus],
              ['Total Price', `₹${order.totalPrice}`],
              ['UPI ID', order.upiId || 'N/A']
            ].map(([f, v], i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{f}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{v}</td>
              </tr>
            ))}
 
            {order.products?.length ? (
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>Products</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  {order.products.map(p => p.productName).join(', ')}
                </td>
              </tr>
            ) : (
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>Product</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{order.productName}</td>
              </tr>
            )}
 
            <tr>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>Quantity</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{order.quantity}</td>
            </tr>
 
            {addressData && (
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>Shipping Address</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  {addressData.street}, {addressData.city}, {addressData.state} – {addressData.postalCode}, {addressData.country}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
 
export default FinalizeOrder;