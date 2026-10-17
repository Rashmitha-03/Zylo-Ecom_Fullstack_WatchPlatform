import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  Modal,
  Table,
  Row,
  Col,
  ListGroup
} from 'react-bootstrap';
import {
  fetchAllUsers,
  fetchOrdersByUserId,
  markOrderAsDelivered
} from '../services/adminService';
import OrderModal from './OrderModal';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [ordersByUser, setOrdersByUser] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsersAndOrders = async () => {
      try {
        const res = await fetchAllUsers();
        setUsers(res.data);

        const orderMap = {};
        for (const user of res.data) {
          try {
            const orderRes = await fetchOrdersByUserId(user.userID);
            orderMap[user.userID] = orderRes.data
              .slice()
              .sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
          } catch (err) {
            console.error(`Failed to fetch orders for user ${user.userID}`, err);
            orderMap[user.userID] = '__error__';
          }
        }

        setOrdersByUser(orderMap);
      } catch (err) {
        console.error('Failed to load users or orders:', err);
      }
    };

    loadUsersAndOrders();
  }, []);

  const handleMarkAsDelivered = async (orderId) => {
    try {
      await markOrderAsDelivered(orderId);
      const updatedOrders = await fetchOrdersByUserId(selectedOrder.userId);
      setOrdersByUser((prev) => ({
        ...prev,
        [selectedOrder.userId]: updatedOrders.data,
      }));
      setShowModal(false);
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

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

      <div className="container px-5" style={{ paddingTop: '6rem', paddingBottom: '3rem' }}>
        {/* Back to Dashboard Button */}
        <div className="d-flex justify-content-start mb-3">
          <button
            onClick={handleBackToDashboard}
            className="btn btn-sm btn-brown"
          >
            <i className="bi bi-arrow-left me-2"></i> Back to Dashboard
          </button>
        </div>

        {/* Centered Header */}
        <h2 className="text-center mb-4" style={{ color: 'black' }}>Admin Dashboard - Manage Orders</h2>

        <Row>
          {/* Left: User List */}
          <Col md={3}>
            <h6>👤 Users</h6>
            <ListGroup>
              {users.map((user) => (
                <ListGroup.Item
                  key={user.userID}
                  action
                  style={{
                    backgroundColor: selectedUserId === user.userID ? '#f3ebe1' : 'transparent'
                  }}
                  onClick={() => setSelectedUserId(user.userID)}
                >
                  {user.firstName} {user.lastName}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>

          {/* Right: Orders Table */}
          <Col md={9}>
            {selectedUserId ? (
              ordersByUser[selectedUserId] === '__error__' ? (
                <p className="text-danger mt-2">❌ Failed to fetch orders.</p>
              ) : ordersByUser[selectedUserId]?.length > 0 ? (
                <>
                  <h6>📦 Orders for user ID {selectedUserId}</h6>
                  <Table striped bordered hover responsive className="mt-2">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Quantity</th>
                        <th>Payment</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersByUser[selectedUserId].map((order) => (
                        <tr key={order.orderId}>
                          <td
                            style={{ cursor: 'pointer', color: 'black' }}
                            onClick={() => {
                              setSelectedOrder({
                                ...order,
                                userId: selectedUserId,
                                updateAmountInPanel: (newAmount) => {
                                  setOrdersByUser(prev => {
                                    const updated = [...(prev[selectedUserId] || [])];
                                    const idx = updated.findIndex(o => o.orderId === order.orderId);
                                    if (idx !== -1) updated[idx].orderAmount = newAmount;
                                    return { ...prev, [selectedUserId]: updated };
                                  });
                                }
                              });
                              setShowModal(true);
                            }}
                          >
                            {order.orderId}
                          </td>
                          <td>{order.orderStatus}</td>
                          <td>₹{order.totalPrice}</td>
                          <td>{order.quantity}</td>
                          <td>{order.paymentStatus}</td>
                          <td>
                            {order.orderStatus === 'Placed' && (
                              <Button
                                size="sm"
                                className="btn-brown"
                                onClick={() => handleMarkAsDelivered(order.orderId)}
                              >
                                Mark Delivered
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              ) : (
                <p className="text-muted mt-2">No orders found for this user.</p>
              )
            ) : (
              <p className="text-muted mt-2">← Select a user to view orders</p>
            )}
          </Col>
        </Row>

        {/* Order Modal */}
        {selectedOrder && (
          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            size="lg"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Order Details - {selectedOrder.orderId}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <OrderModal order={selectedOrder} />
            </Modal.Body>
          </Modal>
        )}
      </div>
    </>
  );
};

export default AdminPanel;
