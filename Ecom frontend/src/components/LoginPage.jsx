import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authLogin(email, password);
    } catch (err) {
      if (err.response) {
        if (
          err.response.status === 500 &&
          err.response.data &&
          err.response.data.email &&
          err.response.data.token === null
        ) {
          setError('Account is inactive. Please contact support or an administrator.');
        } else if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.request) {
          setError('No response from server. Please check your network connection.');
        } else if (err.response.status === 500) {
          setError('An internal server error occurred. Please try again later.');
        } else {
          setError('An unexpected error occurred during login. Please try again.');
        }
      } else {
        setError('An unexpected error occurred: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .custom-input::placeholder {
          color: #f3ebe1;
          opacity: 1;
        }
      `}</style>

      <div
        className="d-flex align-items-center justify-content-center min-vh-100 bg-light"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        <div
          className="card shadow-lg p-4 p-md-5"
          style={{ maxWidth: '450px', width: '100%', borderRadius: '0.5rem' }}
        >
          <h2 className="card-title text-center mb-4 fw-bold" style={{ color: 'black' }}>
            Login
          </h2>
          <p className="text-center text-muted mb-4">Access your account</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label text-secondary">Email:</label>
              <input
                type="email"
                id="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control rounded p-2 custom-input"
                style={{ backgroundColor: '#f3ebe1', fontFamily: 'Georgia, serif', color: 'black' }}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label text-secondary">Password:</label>
              <input
                type="password"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-control rounded p-2 custom-input"
                style={{ backgroundColor: '#f3ebe1', fontFamily: 'Georgia, serif', color: 'black' }}
              />
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show" style={{ borderRadius: '0.25rem' }} role="alert">
                {error}
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="alert"
                  aria-label="Close"
                  onClick={() => setError('')}
                ></button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn w-100 py-2 rounded fw-bold mt-3"
              style={{
                backgroundColor: '#B57B5B',
                borderColor: '#B57B5B',
                color: '#fff',
                fontFamily: 'Georgia, serif',
                transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
              }}
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="mb-2">
              Don't have an account?{' '}
              <Link to="/register" className="text-decoration-none fw-semibold" style={{ color: 'black' }}>
                Register here
              </Link>
            </p>
            <p className="mb-0">
              <Link to="/forgotpassword" className="text-decoration-none fw-semibold" style={{ color: 'black' }}>
                Forgot Password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
