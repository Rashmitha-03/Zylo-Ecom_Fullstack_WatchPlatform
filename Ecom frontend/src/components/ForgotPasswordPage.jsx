import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/v1/users/forgot-password', { email });
      setMessage('If an account with that email exists, a password reset link/instructions have been sent to your email. Please check your inbox.');
      setEmail('');
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Failed to process request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          font-family: Georgia, serif;
        }
        .form-control::placeholder {
          color: #6c757d; /* Darker grey color, a common Bootstrap muted text color */
          opacity: 1;
        }
      `}</style>

      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="card shadow-lg border-0 rounded-lg animate__animated animate__fadeInUp" style={{ maxWidth: '450px', width: '100%' }}>
          <div
            className="card-header text-white text-center py-4"
            style={{ backgroundColor: '#B57B5B' }}
          >
            <h2 className="mb-0 fw-bold">Forgot Password</h2>
          </div>

          <div className="card-body p-4 p-md-5">
            <p className="text-center text-muted fs-6 mb-4">
              Enter your email address below and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="form-label text-muted fw-semibold">Email Address:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-control form-control-lg rounded-pill"
                  placeholder="your.email@example.com"
                  aria-describedby="emailHelp"
                  // Removed 'color: black' from here so the placeholder style can apply
                  style={{ backgroundColor: '#f3ebe1' }} 
                />
                <div id="emailHelp" className="form-text text-muted mt-2">
                  We'll send a password reset link to this email address.
                </div>
              </div>

              {message && (
                <div className="alert alert-success alert-dismissible fade show text-center rounded-pill animate__animated animate__fadeIn" role="alert">
                  {message}
                  <button type="button" className="btn-close" onClick={() => setMessage('')} aria-label="Close"></button>
                </div>
              )}

              {error && (
                <div className="alert alert-danger alert-dismissible fade show text-center rounded-pill animate__animated animate__fadeIn" role="alert">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-lg w-100 rounded-pill fw-bold mt-3 shadow-sm"
                style={{
                  backgroundColor: '#B57B5B',
                  borderColor: '#B57B5B',
                  color: 'white',
                  transition: 'all 0.3s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending Request...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: 'black' }}>
                &larr; Remember your password? Log In
              </Link>
            </div>

            <div className="text-center mt-3">
              <Link
                to="/resetpassword"
                className="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-semibold shadow-sm"
              >
                Reset Password Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;