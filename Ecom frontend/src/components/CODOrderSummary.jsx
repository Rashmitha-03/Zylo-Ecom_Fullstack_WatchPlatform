import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetails, getAddressesByUser } from '../services/serviceapi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../contexts/AuthContext';
 
function CODOrderSummary() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef();
 
  const [order, setOrder] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 
  const { user } = useAuth();
  const userId = user?.id;
 
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data: fetched } = await getOrderDetails(userId, orderId);
        setOrder(fetched);
        if (fetched.addressId) {
          const { data: addrs } = await getAddressesByUser(userId);
          setAddress(addrs.find(a => a.id === fetched.addressId) || null);
        }
      } catch (e) {
        console.error(e);
        setError('Could not fetch order or address.');
      } finally {
        setLoading(false);
      }
    }
    if (orderId && userId) load();
  }, [orderId, userId]);
 
  if (loading) return <p className="text-center mt-5">Loading…</p>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;
  if (!order) return <div className="alert alert-info mt-5">No order found.</div>;
 
  const displayItems = order.orderItems && order.orderItems.length > 0
    ? order.orderItems
    : [{
        productName: order.productName,
        quantity: order.quantity,
        // --- BUG FIX ---
        // Correctly calculate the unit price for single-item orders.
        // Previously, it incorrectly used the total orderAmount as the productPrice.
        productPrice: (order.orderAmount || 0) / (order.quantity || 1)
      }];
 
  const totalQty = displayItems.reduce((sum, it) => sum + (it.quantity || 0), 0);
  const totalPrice = displayItems.reduce(
    (sum, it) => sum + (it.productPrice || 0) * (it.quantity || 0),
    0
  );
 
  const downloadInvoice = async () => {
    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true
    });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, 'PNG', 0, 0, w, h);
    pdf.save(`Invoice_Order_${order.orderId}.pdf`);
  };
 
  return (
    <div
      className="container"
      style={{ marginTop: '6rem', fontFamily: 'Georgia, serif' }}
    >
      <h2>Order Summary</h2>
      <p className="text-success">✅ Your order has been placed!</p>
 
      <div className="card mb-3">
        <div className="card-body">
          <h5>Order Details</h5>
          <ul className="list-group list-group-flush">
            <li className="list-group-item"><strong>Order ID:</strong> {order.orderId}</li>
            <li className="list-group-item"><strong>Total Items:</strong> {totalQty}</li>
            <li className="list-group-item"><strong>Total Price:</strong> ₹{totalPrice.toFixed(2)}</li>
            {/* This line correctly displays the status from the server or 'N/A' if null */}
            <li className="list-group-item"><strong>Order Status:</strong> {order.orderStatus || 'Placed'}</li>
            <li className="list-group-item"><strong>Payment Status:</strong> {order.paymentStatus}</li>
          </ul>
        </div>
      </div>
 
      <div className="card mb-3">
        <div className="card-body">
          <h5>Products</h5>
          <ul className="list-group list-group-flush">
            {displayItems.map((it, idx) => (
              <li key={idx} className="list-group-item d-flex justify-content-between">
                <div>
                  <strong>{it.productName}</strong><br />
                  <small>Qty: {it.quantity}</small>
                </div>
                <span>₹{((it.productPrice || 0) * it.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
 
      <div className="card mb-4">
        <div className="card-body">
          <h5>Shipping Address</h5>
          {address ? (
            <address>
              {address.street}<br />
              {address.city}, {address.state} – {address.postalCode}<br />
              {address.country}
            </address>
          ) : (
            <p>No shipping address available.</p>
          )}
        </div>
      </div>
 
      <div className="mb-4 d-flex gap-3">
        <button
          className="btn"
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#B57B5B',
            color: 'white',
            border: '1px solid #B57B5B'
          }}
        >
          Back to Home
        </button>
 
        <button
          className="btn"
          onClick={downloadInvoice}
          style={{
            border: '1px solid #B57B5B',
            color: 'black',
            backgroundColor: 'transparent'
          }}
        >
          Download Invoice (PDF)
        </button>
      </div>
 
 
      {/* Hidden printable invoice */}
      <div
        ref={invoiceRef}
        style={{
          position: 'absolute',
          top: 0,
          left: -9999,
          width: 800,
          padding: 40,
          background: '#fff',
          fontFamily: 'Georgia, serif',
          fontSize: '12px',
          color: '#333'
        }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: 20 }}>ORDER INVOICE</h1>
        <div style={{ marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid #ccc' }}>
          <div><strong>Date:</strong> {new Date().toLocaleString('en-IN')}</div>
          <div><strong>Order ID:</strong> {order.orderId}</div>
        </div>
 
        <div style={{ marginBottom: 20 }}>
          <h3>Shipping Address</h3>
          {address ? (
            <div>
              {address.street}<br />
              {address.city}, {address.state} – {address.postalCode}<br />
              {address.country}
            </div>
          ) : (
            <div>No address on file</div>
          )}
        </div>
 
        <div style={{ marginBottom: 20 }}>
          <h3>Order Items</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                {['Product', 'Quantity', 'Unit Price', 'Subtotal'].map(h => (
                  <th
                    key={h}
                    style={{
                      border: '1px solid #ccc',
                      padding: '8px',
                      textAlign: 'left'
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayItems.map((it, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    {it.productName}
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                    {it.quantity}
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>
                    ₹{(it.productPrice || 0).toFixed(2)}
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>
                    ₹{((it.productPrice || 0) * it.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
 
        <div style={{ textAlign: 'right', marginTop: 20, paddingTop: 10, borderTop: '1px solid #ccc' }}>
          <div><strong>Total Items:</strong> {totalQty}</div>
          <h4 style={{ margin: '10px 0' }}><strong>Total Price:</strong> ₹{totalPrice.toFixed(2)}</h4>
          <div><strong>Payment Method:</strong> Cash on Delivery</div>
          <div><strong>Payment Status:</strong> {order.paymentStatus}</div>
          {/* This line also correctly shows the fetched status in the PDF */}
          <div><strong>Order Status:</strong> {order.orderStatus || 'Placed'}</div>
        </div>
      </div>
    </div>
  );
}
 
export default CODOrderSummary;