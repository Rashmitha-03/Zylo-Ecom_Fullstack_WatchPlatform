// src/pages/admin/UserDetailAdminPage.js (Updated with Lighter Wood Brown Buttons, White Text, and no shading on boxes)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
 
const UserDetailAdminPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth();
 
  const [userData, setUserData] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [roles, setRoles] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [profileimg, setProfileimg] = useState('');
  const [lastLogin, setLastLogin] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);
 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
 
  const availableRoles = ['USER', 'ADMIN'];
  const defaultProfileImageUrl = "https://placehold.co/150x150/E9DCC9/5C4033?text=No+Image";
 
  // Define an updated, lighter wood brown color palette for buttons
  const paleWoodBrownLight = '#F5F5DC'; // Still good for very light backgrounds
  const paleWoodBrownMedium = '#E7CFA7'; // Lighter beige for subtle elements (e.g., active badge)
  const buttonMainBrown = '#A0522D'; // NEW: Lighter shade of wood brown for button backgrounds (Sienna)
  const whiteText = '#FFFFFF'; // Explicit white text color for buttons
  const redBrownDangerText = '#DC3545'; // Standard Bootstrap danger red for general error/danger text (not button text)
 
  // --- Fetch Specific User Data ---
  const fetchUserData = async () => {
    if (authLoading || !isAuthenticated || !currentUser?.roles?.includes('ADMIN')) {
      setLoading(false);
      setError("You must be logged in as an ADMIN to view this page.");
      return;
    }
 
    setLoading(true);
    setError('');
    setMessage(''); // Clear messages on new fetch
    try {
      const response = await api.get(`/api/v1/users/${userId}`);
      const fetchedUser = response.data;
      setUserData(fetchedUser);
 
      setFirstName(fetchedUser.firstName || '');
      setLastName(fetchedUser.lastName || '');
      setEmail(fetchedUser.email || '');
      setPhoneNumber(fetchedUser.phoneNumber || '');
      setDateOfBirth(fetchedUser.dateOfBirth || '');
      setGender(fetchedUser.gender || '');
 
      console.log('DEBUG: Fetched user roles from API:', fetchedUser.roles);
      setRoles(fetchedUser.roles || []);
 
      setIsActive(fetchedUser.active);
      setProfileimg(fetchedUser.profileimg || '');
      setLastLogin(fetchedUser.lastLogin ? new Date(fetchedUser.lastLogin) : null);
      setUpdatedAt(fetchedUser.updatedAt ? new Date(fetchedUser.updatedAt) : null);
      setCreatedAt(fetchedUser.createdAt ? new Date(fetchedUser.createdAt) : null);
 
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.response?.data?.message || 'Failed to fetch user data. Access Denied or Server Error.');
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchUserData();
  }, [userId, currentUser, isAuthenticated, authLoading]);
 
  // --- Profile Update ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setActionInProgress(true);
    setError('');
    setMessage('');
    try {
      const updateProfileRequest = {
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        gender,
        email,
        profileimg
      };
      await api.put(`/api/v1/users/${userId}`, updateProfileRequest);
      setMessage('User profile updated successfully!');
      fetchUserData();
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError(err.response?.data?.message || 'Failed to update user profile.');
    } finally {
      setActionInProgress(false);
    }
  };
 
  // --- Handle Status Update (Active/Blocked) ---
  const handleStatusUpdate = async (targetIsActive, targetIsBlocked) => {
    setActionInProgress(true);
    setError('');
    setMessage('');
    try {
      const updateStatusRequest = { active: targetIsActive, blocked: targetIsBlocked };
      await api.put(`/api/v1/users/${userId}/status`, updateStatusRequest);
      setMessage('User status updated successfully!');
      setIsActive(targetIsActive);
      setIsBlocked(targetIsBlocked);
      fetchUserData();
    } catch (err) {
      console.error('Error updating user status:', err);
      setError(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setActionInProgress(false);
    }
  };
 
  // --- Handle Roles Update ---
  const handleRolesUpdate = async () => {
    setActionInProgress(true);
    setError('');
    setMessage('');
    console.log('DEBUG: Sending roles to backend:', roles);
    try {
      const assignRolesRequest = {
        userId: parseInt(userId),
        roles: roles
      };
      await api.put(`/api/v1/users/assign-roles`, assignRolesRequest);
      setMessage('User roles updated successfully!');
      fetchUserData();
    } catch (err) {
      console.error('Error updating user roles:', err);
      setError(err.response?.data?.message || 'Failed to update user roles.');
    } finally {
      setActionInProgress(false);
    }
  };
 
  // --- Helper to toggle roles in local state ---
  const toggleRole = (roleToToggle) => {
    console.log('DEBUG: Toggling role:', roleToToggle);
    setRoles(prevRoles => {
      const newRoles = prevRoles.includes(roleToToggle)
        ? prevRoles.filter(r => r !== roleToToggle)
        : [...prevRoles, roleToToggle];
      console.log('DEBUG: Roles state after toggle:', newRoles);
      return newRoles;
    });
  };
 
  // --- handlePermanentDeleteUser is unchanged
  const handleHardDeleteUser = async () => {
    if (window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      setActionInProgress(true);
      setError('');
      setMessage('');
      try {
        await api.delete(`/api/v1/users/${userId}/hard-delete`);
        setMessage('User permanently deleted successfully!');
        navigate('/admin/manage-users');
      } catch (err) {
        console.error('Error permanently deleting user:', err);
        setError(err.response?.data?.message || 'Failed to permanently delete user.');
      } finally {
        setActionInProgress(false);
      }
    }
  };
 
  // --- Conditional Rendering for Loading and Access Denied States ---
  if (authLoading || loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="alert alert-info text-center shadow p-3 rounded-3 border border-primary">
          <h4 className="alert-heading text-primary fs-5 mb-2">Loading User Data...</h4>
          <p className="text-secondary">Please wait while we fetch the user's details.</p>
          <div className="spinner-border text-primary mt-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
 
  if (!userData && !loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="alert alert-danger text-center shadow p-3 rounded-3 border border-danger">
          <h4 className="alert-heading text-danger fs-5 mb-2">User Not Found or Access Denied</h4>
          <p className="text-secondary">{error || `User with ID ${userId} could not be loaded. This user might not exist or you lack the necessary permissions.`}</p>
          <button onClick={() => navigate('/admin/manage-users')} className="btn btn-outline-secondary btn-sm mt-3 shadow rounded-3">
            <i className="bi bi-arrow-left me-2"></i> Back to Users
          </button>
        </div>
      </div>
    );
  }
 
  if (!isAuthenticated || !currentUser?.roles?.includes('ADMIN')) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="alert alert-danger text-center shadow p-3 rounded-3 border border-danger">
          <h4 className="alert-heading text-danger fs-5 mb-2">Access Denied</h4>
          <p className="text-secondary">{error || "You do not have administrative privileges to view this page."}</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="container px-5" style={{ paddingBottom: '1rem', paddingTop: '6rem' }}>      {/* Page Header and Navigation */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h2 className="text-dark fw-bold fs-5 mb-2 mb-md-0 me-md-3 text-center text-md-start">
          User Details: <span className="text-secondary">{userData.email}</span> (ID: <span className="text-muted">{userId}</span>)
        </h2>
        <div className="d-flex flex-column flex-sm-row gap-2">
          {/* Back Button */}
          <button
            onClick={() => navigate('/manageusers')}
            className="btn btn-sm rounded-3 shadow-sm flex-grow-1 py-1" // Changed to btn-sm, py-1
            style={{ backgroundColor: 'transparent', borderColor: buttonMainBrown, color: buttonMainBrown }}
          >
            <i className="bi bi-arrow-left me-2"></i> Back
          </button>
          {/* Refresh Button */}
          <button
            onClick={fetchUserData}
            className="btn btn-sm rounded-3 shadow-sm flex-grow-1 py-1" // Changed to btn-sm, py-1
            disabled={loading || actionInProgress}
            style={{ backgroundColor: 'transparent', borderColor: buttonMainBrown, color: buttonMainBrown }}
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'spinner-grow-sm' : ''} me-2`}></i>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
 
      {/* Alert Messages */}
      {message && <div className="alert alert-success alert-dismissible fade show rounded-3 shadow-sm mb-3 py-2 small" role="alert">
        <strong className="text-success"><i className="bi bi-check-circle-fill me-2"></i>Success:</strong> {message}
        <button type="button" className="btn-close py-1" data-bs-dismiss="alert" aria-label="Close" onClick={() => setMessage('')}></button>
      </div>}
      {error && <div className="alert alert-danger alert-dismissible fade show rounded-3 shadow-sm mb-3 py-2 small" role="alert">
        <strong className="text-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>Error:</strong> {error}
        <button type="button" className="btn-close py-1" data-bs-dismiss="alert" aria-label="Close" onClick={() => setError('')}></button>
      </div>}
 
      <div className="row g-4">
        {/* Profile Details Card */}
        <div className="col-lg-6 col-md-12">
          <div className="card h-100 rounded-4 border border-secondary">
            <div className="card-header bg-body-tertiary text-dark p-3 rounded-top-4 border-bottom border-secondary">
              <h5 className="mb-0 fs-6 fw-bold">User Information & Profile</h5>
            </div>
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <img
                  src={profileimg || defaultProfileImageUrl}
                  alt="Profile"
                  className="rounded-circle border border-dark border-3 p-1 shadow"
                  style={{ width: '180px', height: '180px', objectFit: 'cover' }}
                />
                <h6 className="mt-3 mb-1 text-dark fw-bold fs-5">{firstName} {lastName}</h6>
                <p className="text-muted fs-6">{email}</p>
                <span className={`badge py-2 px-3 rounded-pill`} style={{ backgroundColor: isActive ? paleWoodBrownMedium : redBrownDangerText, color: isActive ? buttonMainBrown : whiteText }}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
                {/* The block status is still displayed if applicable, but the button is removed */}
                {isBlocked && (
                  <span className="badge ms-2 py-2 px-3 rounded-pill" style={{ backgroundColor: buttonMainBrown, color: whiteText }}>
                    Blocked {userData.blockedUntil ? `Until: ${new Date(userData.blockedUntil).toLocaleString()}` : ''}
                  </span>
                )}
              </div>
 
              {/* Profile Details Form */}
              <h6 className="card-subtitle mb-3 text-dark fs-6 fw-bold border-bottom pb-2">Edit Profile</h6>
              <form onSubmit={handleProfileUpdate}>
                <div className="mb-3">
                  <label htmlFor="firstName" className="form-label text-dark fw-bold fs-6">First Name:</label>
                  <input type="text" id="firstName" className="form-control rounded-3 p-3 border border-secondary" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="lastName" className="form-label text-dark fw-bold fs-6">Last Name:</label>
                  <input type="text" id="lastName" className="form-control rounded-3 p-3 border border-secondary" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="phoneNumber" className="form-label text-dark fw-bold fs-6">Phone:</label>
                  <input type="text" id="phoneNumber" className="form-control rounded-3 p-3 border border-secondary" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label htmlFor="dateOfBirth" className="form-label text-dark fw-bold fs-6">Birth Date:</label>
                  <input type="date" id="dateOfBirth" className="form-control rounded-3 p-3 border border-secondary" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label htmlFor="gender" className="form-label text-dark fw-bold fs-6">Gender:</label>
                  <select id="gender" className="form-select rounded-3 p-3 border border-secondary" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {/* Lighter wood brown submit button with white text */}
                <button type="submit"
                  className="btn btn-md w-100 rounded-3 py-2 fs-6 fw-semibold shadow-sm" // Changed to btn-md, py-2, fs-6
                  style={{ backgroundColor: buttonMainBrown, borderColor: buttonMainBrown, color: whiteText }}
                  disabled={actionInProgress}>
                  {actionInProgress ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          </div>
        </div>
 
        {/* Right Column for Account Status & Roles AND Timestamps */}
        <div className="col-lg-6 col-md-12">
          <div className="row g-4">
            {/* Account Status and Roles Card */}
            <div className="col-12">
              <div className="card h-100 rounded-4 border border-secondary">
                <div className="card-header bg-body-tertiary text-dark p-3 rounded-top-4 border-bottom border-secondary">
                  <h5 className="mb-0 fs-6 fw-bold">Status & Roles</h5>
                </div>
                <div className="card-body p-4">
                  {/* Account Status */}
                  <div className="mb-4">
                    <h6 className="card-subtitle mb-3 text-dark fs-6 fw-bold border-bottom pb-2">Account Status</h6>
                    <div className="form-check form-switch mb-3 d-flex align-items-center">
                      <input
                        className="form-check-input me-3"
                        type="checkbox"
                        id="isActiveSwitch"
                        checked={isActive}
                        onChange={(e) => handleStatusUpdate(e.target.checked, isBlocked)}
                        disabled={actionInProgress}
                        style={{ transform: 'scale(1.2)', backgroundColor: isActive ? buttonMainBrown : '', borderColor: isActive ? buttonMainBrown : '' }}
                      />
                      <label className="form-check-label fw-semibold fs-6" htmlFor="isActiveSwitch">
                        {isActive ? 'Active' : 'Inactive'}
                      </label>
                    </div>
                    {/* The block status switch remains, but its corresponding action button is removed */}
                    
                  </div>
 
                  {/* Roles Management */}
                  <div>
                    <h6 className="card-subtitle mb-3 text-dark fs-6 fw-bold border-bottom pb-2">Roles</h6>
                    <div className="d-flex flex-wrap gap-3 mb-3">
                      {availableRoles.map(role => (
                        <div key={role} className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`role-${role}`}
                            value={role}
                            checked={roles.includes(role)}
                            onChange={() => toggleRole(role)}
                            disabled={actionInProgress}
                            style={{ transform: 'scale(1.2)', backgroundColor: roles.includes(role) ? buttonMainBrown : '', borderColor: roles.includes(role) ? buttonMainBrown : '' }}
                          />
                          <label className="form-check-label fs-6 fw-medium" htmlFor={`role-${role}`}>
                            {role}
                          </label>
                        </div>
                      ))}
                    </div>
                    {/* Lighter wood brown save roles button with white text */}
                    <button
                      onClick={handleRolesUpdate}
                      className="btn btn-md w-100 rounded-3 py-2 fs-6 fw-semibold shadow-sm" // Changed to btn-md, py-2, fs-6
                      style={{ backgroundColor: buttonMainBrown, borderColor: buttonMainBrown, color: whiteText }}
                      disabled={actionInProgress}
                    >
                      {actionInProgress ? 'Saving Roles...' : 'Save Roles'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
 
            {/* Timestamps Card */}
            <div className="col-12 mt-lg-0">
              <div className="card rounded-4 border border-secondary">
                <div className="card-header bg-body-tertiary text-dark p-3 rounded-top-4 border-bottom border-secondary">
                  <h5 className="mb-0 fs-6 fw-bold">Timestamps</h5>
                </div>
                <div className="card-body p-4">
                  <ul className="list-group list-group-flush fs-6">
                    <li className="list-group-item d-flex justify-content-between align-items-center py-2 px-0 border-bottom border-light">
                      <strong className="text-dark">Registered:</strong>
                      <span className="text-muted">{createdAt ? createdAt.toLocaleString() : 'N/A'}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center py-2 px-0 border-bottom border-light">
                      <strong className="text-dark">Last Login:</strong>
                      <span className="text-muted">{lastLogin ? lastLogin.toLocaleString() : 'N/A'}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center py-2 px-0">
                      <strong className="text-dark">Last Updated:</strong>
                      <span className="text-muted">{updatedAt ? updatedAt.toLocaleString() : 'N/A'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Direct Actions Row */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card rounded-4 border border-secondary">
            <div className="card-header bg-body-tertiary text-dark p-3 rounded-top-4 border-bottom border-secondary">
              <h5 className="mb-0 fs-6 fw-bold">Direct Actions</h5>
            </div>
            <div className="card-body p-4">
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                {/* Deactivate/Activate Button */}
                <button
                  onClick={() => handleStatusUpdate(!isActive, isBlocked)}
                  className={`btn btn-md rounded-3 py-2 px-3 fs-6 fw-semibold shadow-sm`} // Changed to btn-md, py-2, px-3, fs-6
                  style={{ backgroundColor: buttonMainBrown, borderColor: buttonMainBrown, color: whiteText }}
                  disabled={actionInProgress}
                >
                  {isActive ? <><i className="bi bi-person-x-fill me-2"></i> Deactivate</> : <><i className="bi bi-person-check-fill me-2"></i> Activate</>}
                </button>
 
                {/* Removed Block/Unlock Account Button from here */}
 
                {/* Permanent Delete Button */}
                <button
                  onClick={handleHardDeleteUser}
                  className="btn btn-md rounded-3 py-2 px-3 fs-6 fw-semibold shadow-sm" // Changed to btn-md, py-2, px-3, fs-6
                  style={{ backgroundColor: buttonMainBrown, borderColor: buttonMainBrown, color: whiteText }}
                  disabled={actionInProgress}
                >
                  <i className="bi bi-trash-fill me-2"></i> Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default UserDetailAdminPage;