import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { updatePaymentStatus, getPaymentDetails } from '../services/serviceapi';
import { useAuth } from '../contexts/AuthContext';


function UpdatePaymentStatus() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
const userId = user?.id;

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [action, setAction] = useState(null);

  const doUpdateFlow = async (cancel) => {
    try {
        await updatePaymentStatus(paymentId, cancel); 

      setShowProcessing(true);

      setTimeout(async () => {
        const res = await getPaymentDetails(paymentId);
        setPaymentDetails(res.data);
        setShowProcessing(false);

        if (!cancel) {
          setTimeout(() => {
            navigate(`/finalize-order/${paymentId}`, {
              state: { orderType: location.state?.orderType }
            });
          }, 3000);
        }
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Something went wrong while updating payment status.');
    } finally {
      setLoadingSuccess(false);
      setLoadingCancel(false);
    }
  };

  const animateThenUpdate = (cancel) => {
    if (!cancel) {
      setAction('success');
      setTimeout(() => {
        setAction(null);
        doUpdateFlow(false);
      }, 1500);
    } else {
      setAction('cancel');
      doUpdateFlow(true);
    }
  };

  const handleUpdate = (cancel = false) => {
    if (!userId) {
      alert('User ID is missing.');
      return;
    }
    if (cancel) {
      setLoadingCancel(true);
      animateThenUpdate(true);
    } else {
      setLoadingSuccess(true);
      animateThenUpdate(false);
    }
  };

  return (
    <>
      <style>{`
        body {
          font-family: Georgia, serif;
        }
        .animation-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255,255,255,0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .checkmark {
          font-size: 80px;
          color: #4BB543;
          opacity: 0;
          animation: pop 0.6s ease-out forwards;
        }
        @keyframes pop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .btn-brown {
          background-color: #B57B5B !important;
          color: white !important;
          border: 1px solid #B57B5B !important;
        }
        .btn-outline-brown {
          background-color: transparent !important;
          color: black !important;
          border: 1px solid #B57B5B !important;
        }
        .back-link {
          color: black;
          text-decoration: underline;
          cursor: pointer;
        }
      `}</style>

      <div
        className="text-center"
        style={{ fontFamily: 'Georgia, serif', marginTop: '6rem' }}
      >
        <h2>Payment App</h2>
        <p>Payment ID: {paymentId}</p>

        <div className="mb-3">
          <button
            className="btn back-link"
            onClick={() => navigate('/start-payment')}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            &larr; Back to Checkout
          </button>
        </div>

        <div className="d-flex justify-content-center gap-3 mt-3">
          <button
            className="btn btn-brown"
            onClick={() => handleUpdate(false)}
            disabled={loadingSuccess || loadingCancel}
          >
            {loadingSuccess ? 'Processing...' : 'Make Payment'}
          </button>
          <button
            className="btn btn-outline-brown"
            onClick={() => handleUpdate(true)}
            disabled={loadingSuccess || loadingCancel}
          >
            {loadingCancel ? 'Cancelling...' : 'Cancel Payment'}
          </button>
        </div>

        {action === 'success' && (
          <div className="animation-overlay">
            <div className="checkmark">&#10003;</div>
            <p>Payment Successful</p>
          </div>
        )}

        {showProcessing && (
          <p className="mt-3 text-info">Processing… Please wait</p>
        )}

        {paymentDetails && (
          <div className="mt-4">
            <h4>Payment Details</h4>
            <ul className="list-group">
              <li className="list-group-item">
                <strong>Payment ID:</strong> {paymentDetails.paymentId}
              </li>
              <li className="list-group-item">
                <strong>Amount:</strong> ₹{paymentDetails.amount}
              </li>
              <li className="list-group-item">
                <strong>Status:</strong> {paymentDetails.status}
              </li>
              <li className="list-group-item">
                <strong>UPI URI:</strong> {paymentDetails.upiUri}
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

export default UpdatePaymentStatus;
