// src/pages/UserProfilePage.js (All Styling Integrated)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
// NO SEPARATE CSS IMPORTS - All styling handled via Bootstrap classes and inline styles
// import '../styles/AuthForms.css'; // Removed

const UserProfilePage = () => {
    const { user, isAuthenticated, loading: authLoading, logout } = useAuth(); // Destructure logout from useAuth
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        profileimg: '',
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const defaultProfileImageUrl = "https://placehold.co/150x150/EEEEEE/AAAAAA?text=No+Image";
    const MAX_IMAGE_SIZE_MB = 1;
    const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (authLoading || !isAuthenticated || !user?.id) {
                setLoading(false);
                if (!isAuthenticated) setError("You must be logged in to view your profile.");
                // navigate('/login'); // Consider redirecting here if not authenticated
                return;
            }

            setLoading(true);
            setError('');
            setMessage('');

            try {
                const response = await api.get(`/api/v1/users/${user.id}`);
                const userData = response.data;

                setProfile({
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    email: userData.email || '',
                    phoneNumber: userData.phoneNumber || '',
                    dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '', // Format date for input type="date"
                    gender: userData.gender || '',
                    profileimg: userData.profileimg || '',
                });
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError(err.response?.data?.message || 'Failed to fetch profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [user, isAuthenticated, authLoading]); // Dependencies

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > MAX_IMAGE_SIZE_BYTES) {
                setError(`Image size exceeds the maximum limit of ${MAX_IMAGE_SIZE_MB}MB.`);
                setSelectedFile(null);
                setPreviewImage(null);
                e.target.value = ''; // Clear file input
                return;
            }
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
            setError('');
        } else {
            setSelectedFile(null);
            setPreviewImage(null);
        }
    };

    const handleSubmitProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const updateRequest = {
                firstName: profile.firstName,
                lastName: profile.lastName,
                phoneNumber: profile.phoneNumber,
                dateOfBirth: profile.dateOfBirth,
                gender: profile.gender,
                email: profile.email,
                profileimg: profile.profileimg, // Include current profileimg (even if not changed)
            };
            await api.put(`/api/v1/users/${user.id}`, updateRequest);
            setMessage('Profile updated successfully!');
            setIsEditing(false); // Exit edit mode on success
        } catch (err) {
            console.error('Error updating user profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async () => {
        if (!selectedFile) {
            setError("Please select an image to upload.");
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);

        reader.onloadend = async () => {
            try {
                const base64Image = reader.result;
                await api.put(`/api/v1/users/${user.id}/profile-image`, { profileimg: base64Image });

                setMessage('Profile image updated successfully!');
                setProfile(prev => ({ ...prev, profileimg: base64Image }));
                setSelectedFile(null);
                setPreviewImage(null); // Clear preview after upload
            } catch (err) {
                console.error('Error uploading profile image:', err);
                setError(err.response?.data?.message || 'Failed to upload image. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        reader.onerror = (error) => {
            console.error('FileReader error:', error);
            setError('Failed to read image file.');
            setLoading(false);
        };
    };

    // --- Handle Soft Delete Account ---
    const handleSoftDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This will make your account inactive and you will be logged out.")) {
            return; // User cancelled
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.delete(`/api/v1/users/softdelete/${user.id}`); // Corrected endpoint for soft delete
            setMessage('Your account has been successfully deleted (marked inactive). You are being logged out.');
            setTimeout(() => {
                logout(); // Call logout from AuthContext
                navigate('/login');
            }, 2000); // Give some time for message to display
        } catch (err) {
            console.error('Error soft deleting account:', err);
            setError(err.response?.data?.message || 'Failed to delete account. Please try again.');
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

    const linkHoverUnderlineStyle = {
        position: 'relative',
        textDecoration: 'none',
        display: 'inline-block',
    };

    const beforeHoverLinkStyle = {
        content: "''",
        position: 'absolute',
        width: '0',
        height: '2px',
        bottom: '0',
        left: '0',
        backgroundColor: '#B57B5B', // Changed to #B57B5B
        transition: 'width 0.3s ease-out',
    };

    // New styles for buttons and text
    const customButtonStyle = {
        backgroundColor: '#B57B5B',
        borderColor: '#B57B5B',
        color: '#ffffff',
        fontSize: '1.1rem', // Added font size
        fontFamily: 'Georgia, serif', // Added font family
    };

    const customOutlineButtonStyle = {
        color: '#B57B5B',
        borderColor: '#B57B5B',
        fontSize: '1.1rem', // Added font size
        fontFamily: 'Georgia, serif', // Added font family
    };

    const textStyle = {
        fontSize: '1.1rem',
        fontFamily: 'Georgia, serif',
        color: '#333' // Default text color for general text
    };

    const headingStyle = {
        fontFamily: 'Georgia, serif',
        color: '#B57B5B' // Applying the color to headings for consistency
    };

    const iconColorStyle = {
        color: '#B57B5B' // Color for icons
    };

    // Specific style for "Your Profile" heading
    const yourProfileHeadingStyle = {
        fontFamily: 'Georgia, serif',
        color: 'black' // Changed to black
    };

    if (authLoading || loading) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light" style={textStyle}>
                <div className="alert alert-info text-center shadow-sm p-4 rounded-lg animate__animated animate__fadeIn">
                    <h4 className="alert-heading" style={headingStyle}>Loading Profile...</h4>
                    <p className="mb-0 text-secondary">Please wait while we fetch your data.</p>
                    <div className="spinner-border text-primary mt-3" role="status" style={iconColorStyle}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user?.id) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light" style={textStyle}>
                <div className="alert alert-danger text-center shadow-sm p-4 rounded-lg animate__animated animate__fadeIn">
                    <h4 className="alert-heading text-danger" style={headingStyle}>Access Denied</h4>
                    <p className="mb-0 text-secondary">{error || "You are not authorized to view this page. Please log in."}</p>
                    <Link to="/login" className="btn btn-primary mt-3" style={{ ...customButtonStyle, ...transitionStyle }}>Go to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container px-5" style={{ paddingBottom: '1rem', paddingTop: '8rem', ...textStyle }}>
            <h2 className="text-center mb-4 fw-bold border-bottom pb-3" style={yourProfileHeadingStyle}> {/* Applied specific style here */}
                <i className="bi bi-person-circle me-2" style={iconColorStyle}></i> Your Profile
            </h2>

            {message && (
                <div className="alert alert-success alert-dismissible fade show text-center rounded-pill animate__animated animate__fadeIn" role="alert">
                    {message}
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                        aria-label="Close"
                        onClick={() => setMessage('')}
                    ></button>
                </div>
            )}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show text-center rounded-pill animate__animated animate__fadeIn" role="alert">
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

            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-sm p-4 rounded-lg animate__animated animate__fadeInUp"> {/* Card for content with animation */}
                        <div className="card-body">
                            {/* Profile Image Section */}
                            <div className="text-center mb-4">
                                <img
                                    src={previewImage || profile.profileimg || defaultProfileImageUrl}
                                    alt="Profile"
                                    className="rounded-circle border p-1"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover', transition: 'all 0.3s ease-in-out', borderColor: '#B57B5B' }}
                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultProfileImageUrl; }} // Fallback on error
                                />
                                {isEditing && (
                                    <div className="mt-3">
                                        <input
                                            type="file"
                                            className="form-control form-control-sm rounded-pill border-secondary focus-ring focus-ring-secondary"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            style={{ maxWidth: '250px', margin: 'auto', ...textStyle }}
                                        />
                                        {selectedFile && (
                                            <button
                                                className="btn btn-sm mt-2 rounded-pill"
                                                onClick={handleImageUpload}
                                                disabled={loading}
                                                style={{ ...customOutlineButtonStyle, ...transitionStyle }} // Apply custom outline style
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = buttonHoverStyle.transform;
                                                    e.currentTarget.style.boxShadow = buttonHoverStyle.boxShadow;
                                                    e.currentTarget.style.backgroundColor = customButtonStyle.backgroundColor; // Fill on hover
                                                    e.currentTarget.style.color = customButtonStyle.color; // Text color on hover
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.backgroundColor = 'transparent'; // Revert on leave
                                                    e.currentTarget.style.color = customOutlineButtonStyle.color; // Revert text color on leave
                                                }}
                                            >
                                                {loading ? (<><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Uploading...</>) : (<><i className="bi bi-cloud-arrow-up-fill me-1" style={iconColorStyle}></i> Upload Image</>)}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {!isEditing ? (
                                // Display Mode
                                <div>
                                    <h4 className="mb-3 text-secondary border-bottom pb-2" style={headingStyle}>
                                        <i className="bi bi-info-circle-fill me-2" style={iconColorStyle}></i> Personal Information
                                    </h4>
                                    <ul className="list-group list-group-flush mb-4" style={textStyle}>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <strong><i className="bi bi-person-fill me-2" style={iconColorStyle}></i>Name:</strong>
                                            <span>{profile.firstName} {profile.lastName}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <strong><i className="bi bi-envelope-fill me-2" style={iconColorStyle}></i>Email:</strong>
                                            <span>{profile.email}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <strong><i className="bi bi-phone-fill me-2" style={iconColorStyle}></i>Phone:</strong>
                                            <span>{profile.phoneNumber || 'N/A'}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <strong><i className="bi bi-calendar-date-fill me-2" style={iconColorStyle}></i>Date of Birth:</strong>
                                            <span>{profile.dateOfBirth || 'N/A'}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <strong><i className="bi bi-gender-ambiguous me-2" style={iconColorStyle}></i>Gender:</strong>
                                            <span>{profile.gender || 'N/A'}</span>
                                        </li>
                                    </ul>
                                    <div className="d-flex flex-wrap justify-content-center gap-3">
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="btn btn-lg rounded-pill shadow-sm"
                                            style={{ ...customButtonStyle, ...transitionStyle }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = buttonHoverStyle.transform;
                                                e.currentTarget.style.boxShadow = buttonHoverStyle.boxShadow;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <i className="bi bi-pencil-fill me-2"></i> Edit Profile
                                        </button>
                                        <button
                                            onClick={() => navigate('/changepassword')}
                                            className="btn btn-lg rounded-pill shadow-sm"
                                            style={{ ...customOutlineButtonStyle, ...transitionStyle }} // Changed to customOutlineButtonStyle
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = buttonHoverStyle.transform;
                                                e.currentTarget.style.boxShadow = buttonHoverStyle.boxShadow;
                                                e.currentTarget.style.backgroundColor = customButtonStyle.backgroundColor; // Fill on hover
                                                e.currentTarget.style.color = customButtonStyle.color; // Text color on hover
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.backgroundColor = 'transparent'; // Revert on leave
                                                e.currentTarget.style.color = customOutlineButtonStyle.color; // Revert text color on leave
                                            }}
                                        >
                                            <i className="bi bi-key-fill me-2" style={iconColorStyle}></i> Change Password
                                        </button>
                                        {/* Soft Delete Account Button */}
                                        <button
                                            onClick={handleSoftDeleteAccount}
                                            className="btn btn-danger btn-lg rounded-pill shadow-sm"
                                            disabled={loading}
                                            style={{ ...transitionStyle, fontSize: '1.1rem', fontFamily: 'Georgia, serif' }} // Apply font size and family
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = buttonHoverStyle.transform;
                                                e.currentTarget.style.boxShadow = buttonHoverStyle.boxShadow;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <i className="bi bi-person-x-fill me-2"></i> Delete My Account
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Edit Mode (Form)
                                <form onSubmit={handleSubmitProfile}>
                                    <h4 className="mb-3 text-secondary border-bottom pb-2" style={headingStyle}>
                                        <i className="bi bi-pencil-square me-2" style={iconColorStyle}></i> Edit Information
                                    </h4>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label htmlFor="firstName" className="form-label text-muted fw-semibold" style={textStyle}>First Name:</label>
                                            <input type="text" id="firstName" name="firstName" className="form-control rounded-pill border-primary focus-ring focus-ring-primary" value={profile.firstName} onChange={handleChange} required style={{ borderColor: '#B57B5B', ...textStyle }} />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="lastName" className="form-label text-muted fw-semibold" style={textStyle}>Last Name:</label>
                                            <input type="text" id="lastName" name="lastName" className="form-control rounded-pill border-primary focus-ring focus-ring-primary" value={profile.lastName} onChange={handleChange} required style={{ borderColor: '#B57B5B', ...textStyle }} />
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="email" className="form-label text-muted fw-semibold" style={textStyle}>Email:</label>
                                            <input type="email" id="email" name="email" className="form-control rounded-pill bg-light border-secondary" value={profile.email} readOnly style={textStyle} />
                                            <small className="form-text text-muted ms-2" style={{ ...textStyle, fontSize: '0.9rem' }}><i className="bi bi-info-circle-fill me-1" style={iconColorStyle}></i> Email cannot be changed.</small>
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="phoneNumber" className="form-label text-muted fw-semibold" style={textStyle}>Phone Number:</label>
                                            <input type="tel" id="phoneNumber" name="phoneNumber" className="form-control rounded-pill border-primary focus-ring focus-ring-primary" value={profile.phoneNumber} onChange={handleChange} style={{ borderColor: '#B57B5B', ...textStyle }} />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="dateOfBirth" className="form-label text-muted fw-semibold" style={textStyle}>Date of Birth:</label>
                                            <input type="date" id="dateOfBirth" name="dateOfBirth" className="form-control rounded-pill border-primary focus-ring focus-ring-primary" value={profile.dateOfBirth} onChange={handleChange} style={{ borderColor: '#B57B5B', ...textStyle }} />
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="gender" className="form-label text-muted fw-semibold" style={textStyle}>Gender:</label>
                                            <select id="gender" name="gender" className="form-select rounded-pill border-primary focus-ring focus-ring-primary" value={profile.gender} onChange={handleChange} style={{ borderColor: '#B57B5B', ...textStyle }}>
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                                <option value="Prefer not to say">Prefer not to say</option>
                                            </select>
                                        </div>
                                    </div> {/* End of form row */}

                                    <div className="d-flex justify-content-center gap-3 mt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn btn-lg rounded-pill shadow-sm"
                                            style={{ ...customButtonStyle, ...transitionStyle }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = buttonHoverStyle.transform;
                                                e.currentTarget.style.boxShadow = buttonHoverStyle.boxShadow;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {loading ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...</>) : (<><i className="bi bi-save-fill me-2"></i> Save Changes</>)}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setError('');
                                                setMessage('');
                                                // Re-fetch profile to revert unsaved changes (optional, but good for UX)
                                                // fetchUserProfile(); // If you had fetchUserProfile memoized and outside useEffect
                                            }}
                                            className="btn btn-lg rounded-pill shadow-sm"
                                            disabled={loading}
                                            style={{ ...customOutlineButtonStyle, ...transitionStyle }} // Changed to customOutlineButtonStyle
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = buttonHoverStyle.transform;
                                                e.currentTarget.style.boxShadow = buttonHoverStyle.boxShadow;
                                                e.currentTarget.style.backgroundColor = customButtonStyle.backgroundColor; // Fill on hover
                                                e.currentTarget.style.color = customButtonStyle.color; // Text color on hover
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.backgroundColor = 'transparent'; // Revert on leave
                                                e.currentTarget.style.color = customOutlineButtonStyle.color; // Revert text color on leave
                                            }}
                                        >
                                            <i className="bi bi-x-circle-fill me-2" style={iconColorStyle}></i> Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Back to Dashboard/Home Link */}
            <div className="text-center mt-5" style={textStyle}>
                <Link
                    to="/"
                    className="text-decoration-none fw-semibold"
                    style={{ ...linkHoverUnderlineStyle, color: 'black' }} // Changed color to black
                    onMouseEnter={(e) => {
                        const styleElem = document.createElement('style');
                        styleElem.innerHTML = `
                            .dashboard-link-underline::after {
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
                    <span className="dashboard-link-underline">&larr; Back to Homepage</span>
                </Link>
            </div>
        </div>
    );
};

export default UserProfilePage;