import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for consistent navigation
import api from '../api';
 
const ManageUsersPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
 
  const fetchAllUsers = async () => {
    if (authLoading || !isAuthenticated || !user?.roles?.includes('ADMIN')) {
      setLoading(false);
      setError("You must be logged in as an ADMIN to view this page.");
      return;
    }
 
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/v1/users');
      setUsers(response.data);
      setMessage('');
      console.log("Fetched all users for admin:", response.data);
    } catch (err) {
      console.error('Error fetching all users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users. Access Denied or Server Error.');
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchAllUsers();
  }, [user, isAuthenticated, authLoading]);
 
  const handleViewUserDetails = (userId) => {
    navigate(`/admin/users/${userId}`);
  };
 
  const handleBackToDashboard = () => {
    navigate('/');
  };
 
  if (authLoading || loading) {
    return (
      <div className="container mt-5" style={{ fontFamily: 'Georgia, serif' }}>
        <div className="alert alert-info text-center">
          <h4 className="alert-heading">Loading Users...</h4>
          <p>Please wait while we fetch user data.</p>
        </div>
      </div>
    );
  }
 
  if (!isAuthenticated || !user?.roles?.includes('ADMIN')) {
    return (
      <div className="container mt-5" style={{ fontFamily: 'Georgia, serif' }}>
        <div className="alert alert-danger text-center">
          <h4 className="alert-heading">Access Denied</h4>
          <p>{error || "You do not have administrative privileges to view this page."}</p>
        </div>
      </div>
    );
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
      `}</style>
 
      <div className="container px-5" style={{ paddingBottom: '2rem', paddingTop: '6rem' }}>
        {/* Back to Dashboard Button */}
        <div className="d-flex justify-content-start mb-3">
          <button
            onClick={handleBackToDashboard}
            className="btn btn-sm btn-brown" // Using btn-sm and btn-brown for consistency
          >
            <i className="bi bi-arrow-left me-2"></i> Back to Dashboard
          </button>
        </div>
 
        <h2 className="text-center mb-4" style={{ color: 'black' }}>Manage Users</h2>
 
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
 
        {users.length === 0 ? (
          <div className="alert alert-info text-center">No users found in the system.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle">
              <thead className='table-light'>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Email</th>
                  <th scope="col">First Name</th>
                  <th scope="col">Last Name</th>
                  <th scope="col">Roles</th>
                  <th scope="col">Active</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.userID}>
                    <td>{u.userID}</td>
                    <td>{u.email}</td>
                    <td>{u.firstName}</td>
                    <td>{u.lastName}</td>
                    <td>{u.roles ? u.roles.join(', ') : 'N/A'}</td>
                    <td>{u.active ? 'Yes' : 'No'}</td>
                    <td>
                      <button
                        onClick={() => handleViewUserDetails(u.userID)}
                        className="btn btn-sm btn-brown"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};
 
export default ManageUsersPage;