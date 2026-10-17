
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';


 
const RegisterPage = () => {

  const InfoTooltip = ({ message }) => (
    <OverlayTrigger
      placement="right"
      overlay={
        <Tooltip
          style={{
            backgroundColor: '#000',
            color: '#fff',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.3rem',
            fontSize: '0.875rem',
          }}
        >
          {message}
        </Tooltip>
      }
    >
      <span style={{ cursor: 'pointer', color: '#000', marginLeft: '6px' }}>ⓘ</span>
    </OverlayTrigger>
  );
  


    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(''); // YYYY-MM-DD format
    const [gender, setGender] = useState(''); // Consider a dropdown for fixed options
 
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
 
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }
 
        // Basic client-side validation for empty fields (can be expanded)
        if (!firstName || !lastName || !email || !password || !phoneNumber || !dateOfBirth || !gender) {
            setError('Please fill in all required fields.');
            setLoading(false);
            return;
        }
 
        try {
            const response = await api.post('/api/auth/register', {
                firstName,
                lastName,
                email,
                password,
                phoneNumber,
                dateOfBirth, // Ensure format is YYYY-MM-DD
                gender,
            });
 
            setMessage(response.data.message || 'Registration successful! You can now log in.');
            console.log('Registration successful:', response.data);
 
            setTimeout(() => {
                navigate('/login'); // Redirect to login page after a short delay
            }, 2000);
 
        } catch (err) {
            console.error('Registration error:', err);
            if (err.response) {
                if (err.response.status === 409) {
                    setError('An account with this email already exists.');
                } else if (err.response.status === 400) {
                    // Assuming backend sends detailed validation errors in err.response.data.message
                    const errorMessage = err.response.data.message || 'Please check your input.';
                    setError('Registration failed: ' + errorMessage);
                } else {
                    setError(err.response.data.message || 'An unexpected error occurred during registration.');
                }
            } else if (err.request) {
                setError('No response from server. Please check your network connection.');
            } else {
                setError('Error: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };
 
    // --- Inline Styles for hover effects and transitions ---
    // These styles are defined here and applied via the 'style' prop and onMouseEnter/onMouseLeave events.
    // This is the approach for "all styling here itself" including pseudo-elements.
 
    const transitionStyle = {
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
    };
 
    const buttonHoverStyle = {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    };
 
    // Styles for the link underline hover effect (applied dynamically via JS)
    const linkHoverUnderlineStyle = {
        position: 'relative',
        textDecoration: 'none',
        display: 'inline-block',
    };
 
    const beforeHoverLinkStyle = {
        content: "''", // Pseudo-element content is needed for CSS ::before/:after
        position: 'absolute',
        width: '0',
        height: '2px',
        bottom: '0',
        left: '0',
        backgroundColor: '#0d6efd', // Bootstrap primary color
        transition: 'width 0.3s ease-out',


          

    };
 
    return (
<div className="d-flex align-items-center justify-content-center bg-light animate__animated animate__fadeIn py-5">

            <div className="card shadow-lg p-4 p-md-5 rounded-lg w-100" style={{ maxWidth: '600px'}}> {/* Max width for larger screens */}
            <h2 className="text-center mb-4 text-dark fw-bold border-bottom pb-3">
            <i className="bi bi-person-plus-fill me-2 text-dark"></i> Register
</h2>

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
  <div className="row g-3 mb-3">
    <div className="col-md-6">
      <label htmlFor="firstName" className="form-label text-muted fw-semibold">
        First Name:
        <InfoTooltip message="First name cannot be empty" />
      </label>
      <input
        type="text"
        id="firstName"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
        className="form-control rounded-pill  focus-ring focus-ring-primary"
        style={{ borderColor: '#f3ebe1' }}
        placeholder="John"
      />
    </div>

    <div className="col-md-6">
      <label htmlFor="lastName" className="form-label text-muted fw-semibold">
        Last Name:
        <InfoTooltip message="Last name cannot be empty" />
      </label>
      <input
        type="text"
        id="lastName"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
        className="form-control rounded-pill  focus-ring focus-ring-primary"
        style={{ borderColor: '#f3ebe1' }}
        placeholder="Doe"
      />
    </div>

    <div className="col-12">
      <label htmlFor="email" className="form-label text-muted fw-semibold">
        Email:
        <InfoTooltip message="Enter a valid email that hasn't been used before" />
      </label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="form-control rounded-pill  focus-ring focus-ring-primary"
        style={{ borderColor: '#f3ebe1' }}
        placeholder="john.doe@example.com"
      />
    </div>

    <div className="col-md-6">
      <label htmlFor="password" className="form-label text-muted fw-semibold">
        Password:
        <InfoTooltip message="At least one uppercase, one lowercase, one digit, and one special character, atleast 8 characters" />
      </label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="form-control rounded-pill  focus-ring focus-ring-primary"
        style={{ borderColor: '#f3ebe1' }}
        placeholder="Enter your password"
      />
    </div>

    <div className="col-md-6">
      <label htmlFor="confirmPassword" className="form-label text-muted fw-semibold">
        Confirm Password:
        <InfoTooltip message="Must exactly match the password field" />
      </label>
      <input
        type="password"
        id="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        className="form-control rounded-pill  focus-ring focus-ring-primary"
        style={{ borderColor: '#f3ebe1' }}
        placeholder="Confirm your password"
      />
    </div>

    <div className="col-md-6">
      <label htmlFor="phoneNumber" className="form-label text-muted fw-semibold">
        Phone Number:
        <InfoTooltip message="Use digits, spaces, hyphens or leading +" />
      </label>
      <input
        type="tel"
        id="phoneNumber"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
        className="form-control rounded-pill  focus-ring focus-ring-primary"
        style={{ borderColor: '#f3ebe1' }}
        placeholder="+15551234567"
      />
    </div>

    <div className="col-md-6">
      <label htmlFor="dateOfBirth" className="form-label text-muted fw-semibold">
        Date of Birth:
        <InfoTooltip message="Must be a date in the past" />
      </label>
      <input
        type="date"
        id="dateOfBirth"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
        required
        className="form-control rounded-pill  focus-ring focus-ring-primary"
        style={{ borderColor: '#f3ebe1' }}
      />
    </div>

    <div className="col-12">
      <label htmlFor="gender" className="form-label text-muted fw-semibold">
        Gender:
        <InfoTooltip message="Choose from Male, Female, Other or Prefer not to say" />
      </label>
      <select
        id="gender"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        required
        className="form-select rounded-pill  focus-ring focus-ring-primary"
        style={{ borderColor: '#f3ebe1' }}
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Prefer not to say">Prefer not to say</option>
        <option value="Other">Other</option>
      </select>
    </div>
  </div>

  <div className="d-grid mt-4">
  <button
  type="submit"
  disabled={loading}
  className="btn btn-primary btn-lg rounded-2 shadow-sm fw-semibold"
  style={{
    backgroundColor: '#B57B5B',
    borderColor: '#B57B5B',
    color: '#fff',
    ...transitionStyle
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = buttonHoverStyle.transform;
    e.currentTarget.style.boxShadow = buttonHoverStyle.boxShadow;
    e.currentTarget.style.backgroundColor = '#a66d4b'; // darker hover shade
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
    e.currentTarget.style.backgroundColor = '#B57B5B';
  }}
>
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Registering...
        </>
      ) : (
        <>
          <i className="bi bi-person-check-fill me-2"></i> Register
        </>
      )}
    </button>
  </div>
</form>

 
                <p className="text-center mt-3 text-secondary">
                    Already have an account? {' '}
                    <Link
                        to="/login"
                        className="text-decoration-none text-primary fw-semibold"
                        style={linkHoverUnderlineStyle}
                        onMouseEnter={(e) => {
                            const styleElem = document.createElement('style');
                            styleElem.innerHTML = `
                                .login-link-underline::after {
                                    content: '';
                                    position: absolute;
                                    width: 100%;
                                    height: ${beforeHoverLinkStyle.height};
                                    bottom: ${beforeHoverLinkStyle.bottom};
                                    left: ${beforeHoverLinkStyle.left};
                                    background-color: ${beforeHoverLinkStyle.backgroundColor};
                                    transition: ${beforeHoverLinkStyle.transition};
                                }
                            `;
                            e.currentTarget.appendChild(styleElem);
                        }}
                        onMouseLeave={(e) => {
                            const styleElem = e.currentTarget.querySelector('style');
                            if (styleElem) {
                                styleElem.remove();
                            }
                        }}
                    >
                        <span className="login-link-underline" style={{ color: 'black' }}>Login here</span>
                    </Link>
                </p>
            </div>
        </div>
    );
};
 
export default RegisterPage;




