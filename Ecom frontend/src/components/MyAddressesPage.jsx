// src/pages/MyAddressesPage.js (All Styling Integrated)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
 
// NO SEPARATE CSS IMPORTS - All styling handled via Bootstrap classes and inline styles
// import '../styles/AuthForms.css'; // Removed
// import '../styles/MyAddressesPage.css'; // Removed
 
const MyAddressesPage = () => {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
 
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
 
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phoneNumber: '',
        type: '',
    });
 
    const [editingAddress, setEditingAddress] = useState(null); // Holds address being edited
 
    // Function to fetch addresses
    const fetchAddresses = async () => {
        if (authLoading || !isAuthenticated || !user?.id) {
            setLoading(false);
            if (!isAuthenticated) {
                setError("You must be logged in to view your addresses.");
            } else if (!user?.id) {
                setError("User ID not available. Please log in again.");
            }
            return;
        }
 
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/api/addresses/${user.id}`);
            setAddresses(response.data);
            setMessage('');
            console.log("Addresses data received from backend:", response.data);
        } catch (err) {
            console.error('Error fetching addresses:', err);
            setError(err.response?.data?.message || 'Failed to fetch addresses.');
        } finally {
            setLoading(false);
        }
    };
 
    // Effect hook to fetch addresses when user/auth state changes
    useEffect(() => {
        fetchAddresses();
    }, [user, isAuthenticated, authLoading]); // Dependencies ensure refetch when user state or auth loading changes
 
    const handleNewAddressChange = (e) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({ ...prev, [name]: value }));
    };
 
    const handleAddAddress = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
 
        if (!user?.id) {
            setError("User ID not available. Please log in again.");
            setLoading(false);
            return;
        }
 
        try {
            const response = await api.post(`/api/addresses/${user.id}/add`, newAddress);
            setMessage(response.data.message || 'Address added successfully!');
            setNewAddress({
                street: '', city: '', state: '', postalCode: '', country: '', phoneNumber: '', type: ''
            }); // Clear form
            fetchAddresses(); // Refresh list
        } catch (err) {
            console.error('Error adding address:', err);
            setError(err.response?.data?.message || 'Failed to add address. Please check your input.');
        } finally {
            setLoading(false);
        }
    };
 
    const handleEditAddressChange = (e) => {
        const { name, value } = e.target;
        setEditingAddress(prev => ({ ...prev, [name]: value }));
    };
 
    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
 
        if (!user?.id || !editingAddress?.id) {
            setError("User or Address ID not available for update.");
            setLoading(false);
            return;
        }
 
        try {
            const response = await api.put(`/api/addresses/update/${user.id}`, editingAddress);
            setMessage(response.data.message || 'Address updated successfully!');
            setEditingAddress(null); // Clear editing state
            fetchAddresses(); // Refresh list
        } catch (err) {
            console.error('Error updating address:', err);
            setError(err.response?.data?.message || 'Failed to update address. Please try again.');
        } finally {
            setLoading(false);
        }
    };
 
    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            setLoading(true);
            setError('');
            setMessage('');
            if (!user?.id) {
                setError("User ID not available for delete operation.");
                setLoading(false);
                return;
            }
            try {
                await api.delete(`/api/addresses/${user.id}/delete/${addressId}`);
                setMessage('Address deleted successfully!');
                fetchAddresses(); // Refresh list
            } catch (err) {
                console.error('Error deleting address:', err);
                setError(err.response?.data?.message || 'Failed to delete address.');
            } finally {
                setLoading(false);
            }
        }
    };
 
    const handleSetDefaultAddress = async (addressId) => {
        setLoading(true);
        setError('');
        setMessage('');
        if (!user?.id) {
            setError("User ID not available to set default address.");
            setLoading(false);
            return;
        }
        try {
            await api.put(`/api/addresses/${user.id}/set-default`, {
                userId: user.id,
                addressId: addressId
            });
            setMessage('Default address set successfully!');
            fetchAddresses(); // Refresh list
        } catch (err) {
            console.error('Error setting default address:', err);
            setError(err.response?.data?.message || 'Failed to set default address.');
        } finally {
            setLoading(false);
        }
    };
 
    // Conditional rendering for loading and authentication states
    if (authLoading || loading) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
                <div className="alert alert-info text-center shadow-sm p-4 rounded-lg animate__animated animate__fadeIn">
                    <h4 className="alert-heading text-primary">Loading Addresses...</h4>
                    <p className="mb-0 text-secondary">Please wait while we fetch your addresses.</p>
                    <div className="spinner-border text-primary mt-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }
 
    if (!isAuthenticated || !user?.id) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
                <div className="alert alert-danger text-center shadow-sm p-4 rounded-lg animate__animated animate__fadeIn">
                    <h4 className="alert-heading text-danger">Access Denied</h4>
                    <p className="mb-0 text-secondary">{error || "You are not authorized to view this page. Please log in."}</p>
                    <Link to="/login" className="btn btn-primary mt-3">Go to Login</Link>
                </div>
            </div>
        );
    }
 
    // Inline styles for hover effects and transitions
    const transitionStyle = {
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
    };
 
    const cardHoverStyle = {
        transform: 'scale(1.02)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
        height: '2px', // Original thickness
        bottom: '0',
        left: '0',
        backgroundColor: '#0d6efd', // Bootstrap primary color
        transition: 'width 0.3s ease-out',
    };
 
    const afterHoverLinkStyle = {
        width: '100%',
    };
 
    const hoverLinkUnderlineAltStyle = {
        position: 'relative',
        textDecoration: 'none',
        display: 'inline-block',
    };
 
    const beforeHoverLinkAltStyle = {
        content: "''",
        position: 'absolute',
        width: '0',
        height: '1px', // Thinner line
        bottom: '-1px', // Closer to text
        left: '0',
        backgroundColor: '#6c757d', // Bootstrap secondary color
        transition: 'width 0.3s ease-out',
    };
 
    const afterHoverLinkAltStyle = {
        width: '100%',
    };
 
 
    return (
        // Increased padding for top and bottom, while keeping horizontal padding.
        // You can adjust '8rem' to any value you deem 'a lot more'.
        <div className="container px-5" style={{ paddingBottom: '2rem', paddingTop: '8rem' }}>
            <h2 className="text-center mb-4 text-primary fw-bold border-bottom pb-3">
                <i className="bi bi-geo-alt-fill me-2"></i> My Addresses
            </h2>
 
            {/* Global Messages/Errors */}
            {message && <div className="alert alert-success alert-dismissible fade show text-center rounded-pill animate__animated animate__fadeIn" role="alert">{message}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setMessage('')}></button>
            </div>}
            {error && <div className="alert alert-danger alert-dismissible fade show text-center rounded-pill animate__animated animate__fadeIn" role="alert">{error}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setError('')}></button>
            </div>}
 
            {/* List of Existing Addresses */}
            <h3 className="mb-3 mt-4 text-secondary fw-bold border-bottom pb-2">Your Saved Addresses</h3>
            {addresses.length === 0 ? (
                <div className="alert alert-info text-center p-4 rounded-lg my-4">
                    <i className="bi bi-info-circle-fill me-2"></i> No addresses found. Add your first address below!
                </div>
            ) : (
                <div className="row g-4">
                    {addresses.map((addr) => (
                        <div key={addr.id} className="col-sm-12 col-md-6 col-lg-4">
                            <div
                                className="card h-100 shadow-sm border-0 rounded-lg"
                                style={transitionStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = cardHoverStyle.transform;
                                    e.currentTarget.style.boxShadow = cardHoverStyle.boxShadow;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)'; // Default Bootstrap shadow
                                }}
                            >
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title text-primary mb-3">
                                        <i className="bi bi-house-door-fill me-2"></i> {addr.type} Address
                                        {addr.default && <span className="badge bg-primary ms-2 animate__animated animate__bounceIn">Default</span>}
                                    </h5>
                                    <p className="card-text mb-1 text-dark fw-semibold">{addr.street}</p>
                                    <p className="card-text mb-1 text-muted">{addr.city}, {addr.state} {addr.postalCode}</p>
                                    <p className="card-text mb-2 text-muted">{addr.country}</p>
                                    <p className="card-text text-success fw-medium"><i className="bi bi-telephone-fill me-2"></i> {addr.phoneNumber}</p>
 
                                    <div className="d-flex flex-wrap gap-2 mt-auto pt-3 border-top">
                                        <button
                                            onClick={() => setEditingAddress({ ...addr })}
                                            className="btn btn-sm btn-outline-info rounded-pill"
                                            style={transitionStyle}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = buttonHoverStyle.transform;
                                                e.currentTarget.style.boxShadow = buttonHoverStyle.boxShadow;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = 'none'; // Buttons typically don't have default shadow
                                            }}
                                        >
                                            <i className="bi bi-pencil-fill me-1"></i> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAddress(addr.id)}
                                            className="btn btn-sm btn-outline-danger rounded-pill"
                                            style={transitionStyle}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = buttonHoverStyle.transform;
                                                e.currentTarget.style.boxShadow = buttonHoverStyle.boxShadow;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <i className="bi bi-trash-fill me-1"></i> Delete
                                        </button>
                                        {!addr.default && (
                                            <button
                                                onClick={() => handleSetDefaultAddress(addr.id)}
                                                className="btn btn-sm btn-outline-success rounded-pill"
                                                style={transitionStyle}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = buttonHoverStyle.transform;
                                                    e.currentTarget.style.boxShadow = buttonHoverStyle.boxShadow;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <i className="bi bi-check-circle-fill me-1"></i> Set as Default
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
 
            {/* Add New/Edit Address Form */}
            <h3 className="mb-3 mt-5 text-secondary fw-bold border-bottom pb-2">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
            <div className="card shadow-sm p-4 rounded-lg animate__animated animate__fadeInUp">
                <form onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label htmlFor="street" className="form-label text-muted fw-semibold">Street:</label>
                            <input type="text" id="street" name="street"
                                value={editingAddress ? editingAddress.street : newAddress.street}
                                onChange={editingAddress ? handleEditAddressChange : handleNewAddressChange}
                                required className="form-control rounded-pill border-primary focus-ring focus-ring-primary"
                                placeholder="e.g., 123 Main St"
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="city" className="form-label text-muted fw-semibold">City:</label>
                            <input type="text" id="city" name="city"
                                value={editingAddress ? editingAddress.city : newAddress.city}
                                onChange={editingAddress ? handleEditAddressChange : handleNewAddressChange}
                                required className="form-control rounded-pill border-primary focus-ring focus-ring-primary"
                                placeholder="e.g., New York"
                            />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="state" className="form-label text-muted fw-semibold">State/Province:</label>
                            <input type="text" id="state" name="state"
                                value={editingAddress ? editingAddress.state : newAddress.state}
                                onChange={editingAddress ? handleEditAddressChange : handleNewAddressChange}
                                required className="form-control rounded-pill border-primary focus-ring focus-ring-primary"
                                placeholder="e.g., NY"
                            />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="postalCode" className="form-label text-muted fw-semibold">Postal Code:</label>
                            <input type="text" id="postalCode" name="postalCode"
                                value={editingAddress ? editingAddress.postalCode : newAddress.postalCode}
                                onChange={editingAddress ? handleEditAddressChange : handleNewAddressChange}
                                required className="form-control rounded-pill border-primary focus-ring focus-ring-primary"
                                placeholder="e.g., 10001"
                            />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="country" className="form-label text-muted fw-semibold">Country:</label>
                            <input type="text" id="country" name="country"
                                value={editingAddress ? editingAddress.country : newAddress.country}
                                onChange={editingAddress ? handleEditAddressChange : handleNewAddressChange}
                                required className="form-control rounded-pill border-primary focus-ring focus-ring-primary"
                                placeholder="e.g., USA"
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="phoneNumber" className="form-label text-muted fw-semibold">Phone Number:</label>
                            <input type="tel" id="phoneNumber" name="phoneNumber"
                                value={editingAddress ? editingAddress.phoneNumber : newAddress.phoneNumber}
                                onChange={editingAddress ? handleEditAddressChange : handleNewAddressChange}
                                required className="form-control rounded-pill border-primary focus-ring focus-ring-primary"
                                placeholder="e.g., +15551234567"
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="type" className="form-label text-muted fw-semibold">Address Type:</label>
                            <select id="type" name="type"
                                value={editingAddress ? editingAddress.type : newAddress.type}
                                onChange={editingAddress ? handleEditAddressChange : handleNewAddressChange}
                                required className="form-select rounded-pill border-primary focus-ring focus-ring-primary"
                            >
                                <option value="">Select Type</option>
                                <option value="HOME">Home</option>
                                <option value="WORK">Work</option>
                                <option value="BILLING">Billing</option>
                                <option value="SHIPPING">Shipping</option>
                            </select>
                        </div>
                    </div>
 
                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn ${editingAddress ? 'btn-success' : 'btn-primary'} btn-lg rounded-pill shadow-sm`}
                            style={transitionStyle} // Apply inline transition
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = buttonHoverStyle.transform;
                                e.currentTarget.style.boxShadow = buttonHoverStyle.boxShadow;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Saving...
                                </>
                            ) : (
                                editingAddress ? (<><i className="bi bi-save-fill me-1"></i> Update Address</>) : (<><i className="bi bi-plus-circle-fill me-1"></i> Add Address</>)
                            )}
                        </button>
                        {editingAddress && (
                            <button
                                type="button"
                                onClick={() => setEditingAddress(null)}
                                className="btn btn-secondary btn-lg rounded-pill shadow-sm"
                                style={transitionStyle} // Apply inline transition
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = buttonHoverStyle.transform;
                                    e.currentTarget.style.boxShadow = buttonHoverStyle.boxShadow;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                disabled={loading}
                            >
                                <i className="bi bi-x-circle-fill me-1"></i> Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>
 
            <div className="text-center mt-5">
                <Link
                    to="/"
                    className="text-decoration-none text-primary fw-semibold"
                    style={linkHoverUnderlineStyle}
                    onMouseEnter={(e) => {
                        const styleElem = document.createElement('style');
                        styleElem.innerHTML = `
                            .hover-underline::after {
                                width: 100%;
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
                    <span
                        style={beforeHoverLinkStyle}
                        className="hover-underline" // Add this class for dynamic style targeting
                    ></span>
                    &larr; Back to Homepage
                </Link>
            </div>
        </div> // Closing tag for the new container
    );
};
 
export default MyAddressesPage;