import React, { useEffect, useState } from 'react';
import {
  getAllAdminProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  softDeleteProduct,
  restoreProduct
} from '../services/adminProductService';
import {
  Table,
  Modal,
  Form,
  Spinner,
  Alert,
  Badge
} from 'react-bootstrap';

const initialForm = {
  name: '',
  shortdescription: '',
  longdescription: '',
  price: '',
  gender: '',
  color: '',
  material: '',
  type: '',
  imageURL: '',
  stock: ''
};

const AdminProductPage = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getAllAdminProducts(); // ✅ Must call /getAllProductsforAdmin
      setProducts(res.data);
    } catch {
      setMessage('Failed to load products.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleShow = (product = null) => {
    if (product) {
      setEditId(product.productID);
      setFormData({
        ...initialForm,
        ...product,
        price: String(product.price),
        stock: String(product.stock)
      });
    } else {
      setEditId(null);
      setFormData(initialForm);
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setFormData(initialForm);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedPrice = parseFloat(formData.price);
    const parsedStock = parseInt(formData.stock);
    if (parsedPrice < 0 || parsedStock < 0) {
      setMessage('Price and Stock must be non-negative.');
      return;
    }
    const payload = {
      ...formData,
      price: parsedPrice,
      stock: parsedStock
    };
    try {
      if (editId) {
        await updateProduct(editId, payload);
        setMessage('Product updated successfully.');
      } else {
        await addProduct(payload);
        setMessage('Product added successfully.');
      }
      handleClose();
      loadProducts();
    } catch {
      setMessage('Operation failed.');
    }
  };

  const handleAction = async (type, id) => {
    try {
      if (type === 'delete') {
        const confirm = window.confirm('Are you sure you want to permanently delete this product?');
        if (!confirm) return;
        await deleteProduct(id);
      }
      if (type === 'soft') await softDeleteProduct(id);
      if (type === 'restore') await restoreProduct(id);
      loadProducts();
    } catch {
      setMessage('Action failed.');
    }
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
        .icon-action {
          cursor: pointer;
          font-size: 1.2em;
          margin-right: 0.5rem;
          user-select: none;
        }
        .icon-action:hover {
          opacity: 0.8;
        }
      `}</style>

      <div className="container px-5" style={{ paddingBottom: '2rem', paddingTop: '6rem' }}>
        <h2 className="mb-4">Admin Product Dashboard</h2>
        {message && <Alert variant="info">{message}</Alert>}
        <div className="d-flex justify-content-between mb-3">
          <button className="btn btn-brown" onClick={() => handleShow()}>
            + Add Product
          </button>
        </div>
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Table striped bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Gender</th>
                <th>Price (₹)</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.productID}>
                  <td>{p.productID}</td>
                  <td>{p.name}</td>
                  <td>{p.type}</td>
                  <td>{p.gender}</td>
                  <td>{p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    <Badge bg={p.active ? 'success' : 'secondary'}>
                      {p.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="text-center">
                    <span
                      className="icon-action"
                      title="Edit Product"
                      onClick={() => handleShow(p)}
                    >✏️</span>
                    <span
                      className="icon-action"
                      title="Soft Delete"
                      onClick={() => handleAction('soft', p.productID)}
                    >⛔</span>
                    <span
                      className="icon-action"
                      title="Delete Permanently"
                      onClick={() => handleAction('delete', p.productID)}
                    >❌</span>
                    <span
                      className="icon-action"
                      title="Restore Product"
                      onClick={() => handleAction('restore', p.productID)}
                    >🔄</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{editId ? 'Edit Product' : 'Add Product'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              {Object.keys(initialForm).map(field => (
                <Form.Group className="mb-3" key={field}>
                  <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                  <Form.Control
                    type={['price', 'stock'].includes(field) ? 'number' : 'text'}
                    min={['price', 'stock'].includes(field) ? 0 : undefined}
                    value={formData[field]}
                    onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                    required
                  />
                </Form.Group>
              ))}
              <button type="submit" className="btn btn-brown w-100 fw-bold">
                {editId ? 'Update' : 'Add'} Product
              </button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default AdminProductPage;
