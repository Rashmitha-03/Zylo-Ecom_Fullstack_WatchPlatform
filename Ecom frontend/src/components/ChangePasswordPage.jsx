import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const ChangePasswordPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.id)) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirm new password do not match.");
      setLoading(false);
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (!user.email) {
      setError("User email not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      await api.put(`/api/v1/users/${user.id}/change-password`, {
        email: user.email,
        oldPassword: currentPassword,
        newPassword: newPassword
      });
      setMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        navigate(' /userprofile');
      }, 2000);
    } catch (err) {
      console.error('Change password error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to change password. Please check your current password and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light" style={{ fontFamily: 'Georgia, serif' }}>
        <div className="alert alert-info text-center shadow-sm p-4 rounded-lg">
          <h4 className="alert-heading" style={{ color: 'black' }}>Loading Authentication...</h4>
          <p className="mb-0 text-secondary">Please wait.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.id) {
    return null;
  }

  return (
    <>
      <style>{`
        * {
          font-family: Georgia, serif;
        }
        .btn-brown {
          background-color: #B57B5B !important;
          border-color: #B57B5B !important;
          color: white !important;
        }
        .btn-brown:hover {
          background-color: #a66d4b !important;
          border-color: #a66d4b !important;
        }
        .custom-input {
          border-color: #f3ebe1 !important;
          border-radius: 0 !important;
        }
        .custom-input::placeholder {
          color: #aaa;
        }
      `}</style>

      <div
        className="d-flex align-items-center justify-content-center min-vh-100 p-3"
        style={{ marginTop: '6rem', marginBottom: '4rem' }}
      >
        <div className="card shadow-lg border-0 rounded-lg animate__animated animate__fadeInDown" style={{ maxWidth: '500px', width: '100%', overflow: 'hidden' }}>
          <div className="card-header text-white text-center py-4" style={{ backgroundColor: '#B57B5B' }}>
            <h2 className="mb-0 fw-bold">Change Your Password</h2>
          </div>
          <div className="card-body p-4 p-md-5">
            <p className="text-center text-muted mb-4 fs-6">
              Enter your current password and choose a new one.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="currentPassword" className="form-label text-muted fw-semibold">Current Password:</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="form-control form-control-lg custom-input"
                  placeholder="Enter current password"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label text-muted fw-semibold">New Password:</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="form-control form-control-lg custom-input"
                  placeholder="Enter new password"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="confirmNewPassword" className="form-label text-muted fw-semibold">Confirm New Password:</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="form-control form-control-lg custom-input"
                  placeholder="Confirm new password"
                />
              </div>

              {message && (
                <div className="alert alert-success alert-dismissible fade show text-center rounded-pill animate__animated animate__fadeIn" role="alert">
                  {message}
                  <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                </div>
              )}

              {error && (
                <div className="alert alert-danger alert-dismissible fade show text-center rounded-pill animate__animated animate__fadeIn" role="alert">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-brown btn-lg w-100 fw-bold mt-3 shadow-sm"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Changing Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <Link to="/userprofile" className="text-decoration-none fw-semibold" style={{ color: 'black' }}>
                &larr; Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordPage;
