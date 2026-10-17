import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import StarRating from './StarRating';
import { useAuth } from '../contexts/AuthContext';
import {
  getAllPublicProducts as fetchAllProductsService,
  getFilteredProducts as fetchFilteredProductsService,
  addToCart as addToCartService
} from '../services/productService';

const Product = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    type: '',
    gender: '',
    color: '',
    material: '',
    name: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    if (!loading) {
      const cards = document.querySelectorAll('.card');
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.classList.add('animate__animated', 'animate__fadeInUp');
        }, i * 100);
      });
    }
  }, [loading]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const genderFromQuery = params.get('gender');

    if (genderFromQuery) {
      const cleanedFilters = {
        minPrice: '',
        maxPrice: '',
        type: '',
        gender: genderFromQuery,
        color: '',
        material: '',
        name: ''
      };

      setLoading(true);
      setFilters(cleanedFilters);

      fetchFilteredProductsService({ gender: genderFromQuery })
        .then((res) => {
          setProducts(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching filtered products', err);
          setLoading(false);
        });
    } else {
      handleFetchAllProducts();
    }
  }, [location.search]);

  const handleFetchAllProducts = () => {
    setLoading(true);
    setFilters({
      minPrice: '',
      maxPrice: '',
      type: '',
      gender: '',
      color: '',
      material: '',
      name: ''
    });

    fetchAllProductsService()
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error Fetching products', error);
        setLoading(false);
      });
  };

  const handleFetchFilteredProducts = () => {
    setLoading(true);
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters)
        .filter(([_, v]) => v !== '')
        .map(([k, v]) => {
          if (['minPrice', 'maxPrice'].includes(k)) {
            return [k, v.trim() === '' ? null : Number(v)];
          }
          return [k, v];
        })
    );

    fetchFilteredProductsService(cleanedFilters)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching filtered products', err);
        setLoading(false);
      });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className="container-fluid px-3 px-md-4 my-4"
      style={{ paddingTop: '75px', fontFamily: 'Georgia, serif' }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn text-white fw-bold"
          style={{ backgroundColor: '#B57B5B', borderColor: '#B57B5B' }}
          onClick={() => setShowFilters((prev) => !prev)}
        >
          {showFilters ? '✖ Close Filters' : '☰ Open Filters'}
        </button>
      </div>

      <div className="row">
        {showFilters && (
          <div className="col-md-3 mb-4">
            <div className="position-sticky" style={{ top: '20px' }}>
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <h5 className="card-title mb-3">Filters</h5>
                  <div className="d-grid gap-3">
                    <input type="number" name="minPrice" min="0" value={filters.minPrice} onChange={handleFilterChange} placeholder="Min Price" className="form-control" />
                    <input type="number" name="maxPrice" min="0" value={filters.maxPrice} onChange={handleFilterChange} placeholder="Max Price" className="form-control" />
                    <input type="text" name="name" value={filters.name} onChange={handleFilterChange} placeholder="Product Name" className="form-control" />

                    <select name="type" value={filters.type} onChange={handleFilterChange} className="form-select">
                      <option value="">All Types</option>
                      <option value="Analog">Analog</option>
                      <option value="Digital">Digital</option>
                    </select>

                    <select name="gender" value={filters.gender} onChange={handleFilterChange} className="form-select">
                      <option value="">All Genders</option>
                      <option value="Men">Male</option>
                      <option value="Women">Female</option>
                      <option value="Unisex">Unisex</option>
                    </select>

                    <select name="color" value={filters.color} onChange={handleFilterChange} className="form-select">
                      <option value="">All Colors</option>
                      <option value="Black">Black</option>
                      <option value="Blue">Blue</option>
                      <option value="Brown">Brown</option>
                      <option value="Rose Gold">Rose Gold</option>
                      <option value="Silver">Silver</option>
                    </select>

                    <select name="material" value={filters.material} onChange={handleFilterChange} className="form-select">
                      <option value="">All Materials</option>
                      <option value="Leather">Leather</option>
                      <option value="Titanium">Titanium</option>
                      <option value="Platinum">Platinum</option>
                    </select>

                    <button
                      className="btn text-white fw-bold"
                      style={{ backgroundColor: '#B57B5B', borderColor: '#B57B5B' }}
                      onClick={handleFetchFilteredProducts}
                    >
                      Apply Filters
                    </button>
                    <button className="btn btn-outline-secondary fw-bold" onClick={handleFetchAllProducts}>
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={showFilters ? 'col-md-9' : 'col-md-12'}>
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <p className="text-muted">No products match the selected filters.</p>
          ) : (
            <div className={`row row-cols-1 row-cols-sm-2 ${showFilters ? 'row-cols-md-3' : 'row-cols-md-4'} g-4`}>
              {products.map((product) => (
                <div className="col" key={product.productID}>
                  <Link to={`/product/${product.productID}`} className="text-decoration-none text-dark">
                    <div className="card h-100 d-flex flex-column shadow-sm border-0">
                      <div className="ratio ratio-1x1">
                        <img src={product.imageURL} alt={product.name} className="card-img-top object-fit-cover" />
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title text-truncate">{product.name}</h5>
                        <StarRating rating={product.avgRating} />
                        <p className="card-text text-muted small flex-grow-1 " style={{ fontSize: '1.1rem' }}>
                          {product.shortdescription?.length > 100
                            ? product.shortdescription.substring(0, 100) + '…'
                            : product.shortdescription}
                        </p>
                        <p className="fw-bold mb-2">₹{product.price}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
