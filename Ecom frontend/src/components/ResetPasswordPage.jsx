import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

const ResetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState(''); // State for the verification token
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // Hook to access URL query parameters

    // NEW STATE: To track if email/token were pre-filled from URL
    const [isEmailPrefilled, setIsEmailPrefilled] = useState(false);
    const [isTokenPrefilled, setIsTokenPrefilled] = useState(false);

    // Use useEffect to extract email and token from URL query parameters on component mount
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailFromUrl = params.get('email');
        const tokenFromUrl = params.get('token');

        if (emailFromUrl) {
            setEmail(emailFromUrl);
            setIsEmailPrefilled(true); // Mark as pre-filled
        } else {
            setIsEmailPrefilled(false);
        }

        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            setIsTokenPrefilled(true); // Mark as pre-filled
        } else {
            setIsTokenPrefilled(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]); // Re-run if URL query parameters change

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            setLoading(false);
            return;
        }

        if (!email || !token || !newPassword) {
            setError("All fields (Email, Token, New Password) are required.");
            setLoading(false);
            return;
        }

        try {
            // API endpoint: POST /api/v1/users/reset-password
            // This will trigger the backend to validate the token and update the password.
            await api.post('/api/v1/users/reset-password', {
                email,
                token, // Send the token received by the user
                newPassword
            });
            setMessage('Your password has been successfully reset! You can now log in with your new password.');
            // Optionally, redirect to login page after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 3000); // Redirect after 3 seconds
        } catch (err) {
            console.error('Password reset error:', err);
            setError(err.response?.data?.message || 'Failed to reset password. Please check your email and token, and try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- Inline Styles for hover effects and transitions ---
    const transitionStyle = {
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
    };

    const buttonHoverStyle = {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    };


    return (
        <>
            <style>{`
                /* Global font for the entire component */
                * {
                    font-family: Georgia, serif;
                }
                /* Styles for text inputs */
                .form-control.custom-input-style {
                    font-size: 1.1rem;
                    font-family: Georgia, serif; /* Apply font to inputs */
                    background-color: #f3ebe1; /* Input background color */
                    color: #333; /* Darker grey for input text for readability */
                    border-color: #ced4da; /* Default Bootstrap grey border */
                }
                /* Placeholder text color for the inputs */
                .form-control.custom-input-style::placeholder {
                    color: #888; /* Darker grey for placeholder on light background */
                    opacity: 1; /* Ensure opacity is 1 so it's fully visible */
                }
                /* Focus state for inputs */
                .form-control.custom-input-style:focus {
                    border-color: #B57B5B !important; /* Border color on focus */
                    box-shadow: 0 0 0 0.25rem rgba(181, 123, 91, 0.25) !important; /* Custom focus ring color */
                }

                /* Specific style for the login link underline on hover */
                .login-link-underline::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    background-color: #B57B5B; /* Set underline color to #B57B5B */
                    transition: width 0.3s ease-out;
                }
                .login-link-underline:hover::after {
                    width: 100%;
                }
            `}</style>

            <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light animate__animated animate__fadeIn py-5">
                <div className="card shadow-lg p-4 p-md-5 rounded-lg w-100" style={{ maxWidth: '500px' }}> {/* Max width for larger screens */}
                    <h2 className="text-center mb-4 fw-bold border-bottom pb-3" style={{ color: '#B57B5B' }}>
                        <i className="bi bi-key-fill me-2"></i> Reset Password
                    </h2>
                    <p className="text-center mb-4 text-muted">
                        Enter your email, the verification token, and your new password.
                    </p>

                    {message && (
                        <div className="alert alert-success alert-dismissible fade show text-center rounded-pill animate__animated animate__fadeIn" role="alert">
                            {message}
                            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setMessage('')}></button>
                        </div>
                    )}
                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show text-center rounded-pill animate__animated animate__fadeIn" role="alert">
                            {error}
                            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setError('')}></button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label text-muted fw-semibold">Email:</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="form-control rounded-pill custom-input-style"
                                readOnly={isEmailPrefilled}
                                // Ensure inline style for prefilled background color also matches #f3ebe1 or a variant
                                style={{ backgroundColor: isEmailPrefilled ? '#e0e0d8' : '#f3ebe1', color: isEmailPrefilled ? '#666' : '#333' }}
                                aria-describedby="emailHelp"
                                placeholder="your.email@example.com"
                            />
                            <small id="emailHelp" className="form-text text-muted ms-2">
                                <i className="bi bi-info-circle-fill me-1"></i> Ensure this matches the email used for password reset request.
                            </small>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="token" className="form-label text-muted fw-semibold">Verification Token:</label>
                            <input
                                type="text"
                                id="token"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                required
                                className="form-control rounded-pill custom-input-style"
                                readOnly={isTokenPrefilled}
                                // Ensure inline style for prefilled background color also matches #f3ebe1 or a variant
                                style={{ backgroundColor: isTokenPrefilled ? '#e0e0d8' : '#f3ebe1', color: isTokenPrefilled ? '#666' : '#333' }}
                                aria-describedby="tokenHelp"
                                placeholder="Enter token from email"
                            />
                            <small id="tokenHelp" className="form-text text-muted ms-2">
                                <i className="bi bi-envelope-fill me-1"></i> This token was sent to your email.
                            </small>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="newPassword" className="form-label text-muted fw-semibold">New Password:</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="form-control rounded-pill custom-input-style"
                                placeholder="Enter your new password"
                            />
                        </div>
                        <div className="mb-4"> {/* Increased margin bottom for button */}
                            <label htmlFor="confirmPassword" className="form-label text-muted fw-semibold">Confirm New Password:</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="form-control rounded-pill custom-input-style"
                                placeholder="Confirm your new password"
                            />
                        </div>

                        <div className="d-grid"> {/* Use d-grid for full-width button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-lg rounded-pill shadow-sm"
                                style={{
                                    backgroundColor: '#B57B5B', // Button background color
                                    borderColor: '#B57B5B',     // Button border color
                                    color: 'white',
                                    ...transitionStyle
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = buttonHoverStyle.transform;
                                    e.currentTarget.style.boxShadow = buttonHoverStyle.boxShadow;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)'; // Default Bootstrap shadow for buttons
                                }}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Resetting...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-arrow-clockwise me-2"></i> Reset Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="text-center mt-3 text-secondary">
                        Remember your password? {' '}
                        <Link
                            to="/login"
                            className="text-decoration-none fw-semibold"
                            style={{ color: '#B57B5B' }}
                        >
                            <span className="login-link-underline">Log In</span>
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default ResetPasswordPage;