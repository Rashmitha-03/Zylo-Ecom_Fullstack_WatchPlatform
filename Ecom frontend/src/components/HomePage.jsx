import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaGift } from 'react-icons/fa';
import { Carousel, Card, Button, Row, Col, Container, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getProductById } from '../services/homePageService'; 
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { useNavigate } from 'react-router-dom';


const HeroCarousel = () => {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate('/products');
  };

  const headingStyle = {
    fontFamily: 'Georgia, serif',
    fontWeight: 700,
    fontStyle: 'italic',
    letterSpacing: '0.5px',
  };

  const paragraphStyle = {
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontSize: '1.25rem',
    lineHeight: 1.6,
    opacity: 0.95,
  };

  return (
    <Carousel
      fade
      interval={3000}
      className="mt-0 position-relative"
      ride="carousel"
      controls={false}
    >
      {/* Slide 1 */}
      <Carousel.Item>
        <div className="position-relative w-100" style={{ height: '100vh' }}>
          <img
            src="https://vero-watch.com/cdn/shop/collections/sw-q-series-639326.png?v=1718726026&width=1920"
            alt="Zylo Watch Slide"
            className="w-100 h-100"
            style={{ objectFit: 'cover' }}
          />
          <div
            className="position-absolute text-white"
            style={{
              top: '65%',
              left: '5%',
              maxWidth: '500px',
              transform: 'translateY(-50%)',
              zIndex: 1050,
              pointerEvents: 'auto',
            }}
          >
            <div className="d-flex flex-column gap-2">
              <h2 className="display-5 mb-0" style={headingStyle}>
                Zylo Elegance
              </h2>
              <p className="lead mb-1" style={paragraphStyle}>
                Where timeless design meets modern craftsmanship.
              </p>
              <Button
                variant="light"
                className="fw-semibold align-self-start"
                onClick={handleShopNow}
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </Carousel.Item>

      {/* Slide 2 */}
      <Carousel.Item>
        <div className="position-relative w-100" style={{ height: '100vh' }}>
          <img
            src="https://usa.watchpro.com/2019/12/Torgoen-edit.jpg"
            alt="Zylo Slide 2"
            className="w-100 h-100"
            style={{ objectFit: 'cover' }}
          />
          <div
            className="position-absolute text-white"
            style={{
              top: '65%',
              left: '5%',
              maxWidth: '500px',
              transform: 'translateY(-50%)',
              zIndex: 1050,
              pointerEvents: 'auto',
            }}
          >
            <div className="d-flex flex-column gap-2">
              <h2 className="display-5 mb-0" style={headingStyle}>
                Zylo
              </h2>
              <p className="lead mb-1" style={paragraphStyle}>
                Precision watches for those who value every second.
              </p>
              <Button
                variant="light"
                className="fw-semibold align-self-start"
                onClick={handleShopNow}
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </Carousel.Item>
    </Carousel>
  );
};




const FeatureHighlights = () => (
  <Container className="py-5">
    <Row className="g-4 text-center">
      {[
        {
          icon: 'bi-lightning-charge',
          title: 'Fast Delivery',
          text: 'Swift and secure shipping at your doorstep',
        },
        {
          icon: 'bi-gem',
          title: 'Premium Quality',
          text: 'Crafted with detail and elegance in mind',
        },
        {
          icon: 'bi-arrow-repeat',
          title: 'Easy Returns',
          text: 'Hassle-free returns on every purchase',
        },
        {
          icon: 'bi-shield-check',
          title: 'Secure Payments',
          text: 'Safe and encrypted transactions guaranteed',
        },
      ].map((feature, idx) => (
        <Col md={3} key={idx}>
          <div
            className="card h-100 border-0 shadow-sm text-dark"
            style={{
              transition: 'all 0.3s ease-in-out',
              fontFamily: 'Georgia, serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0.5rem 1.2rem rgba(0,0,0,0.12)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="card-body">
              <i className={`bi ${feature.icon} display-4 text-dark`}></i>
              <h5 className="fw-semibold mt-3">{feature.title}</h5>
              <p className="text-muted small mb-0">{feature.text}</p>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  </Container>
);

  
const SectionHeading1 = ({ text }) => (
  <Container className="py-3">
    <div className="text-center position-relative">
      <h2
        className="fw-bold display-6 text-uppercase"
        style={{
          color: 'black',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          letterSpacing: '1px',
          marginBottom: '0.5rem',
          fontFamily: '"Times New Roman", Times, serif',
          fontStyle: 'normal',
        }}
      >
        {text}
      </h2>
      <div
        className="mx-auto"
        style={{
          width: '90px',
          height: '3px',
          backgroundColor: '#6c757d',
          borderRadius: '1px',
        }}
      ></div>
    </div>
  </Container>
);



const productIds = [1,2,3,4];
const FeatureCards1 = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const responses = await Promise.all(
          productIds.map((id) =>
            getProductById(id).then((res) => {
              console.log(`Product ${id}:`, res.data);
              return {
                id,
                name: res.data.name,
                title: res.data.title,
                description: res.data.shortdescription,
                imageUrl: res.data.imageURL,
              };
            })
          )
        );
        setProducts(responses);
      } catch (err) {
        console.error('Error fetching product data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="secondary" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      <Row className="g-4">
        {products.map((product) => (
          <Col md={3} key={product.id}>
            <Card
              className="h-100 shadow-sm"
              style={{
                fontFamily: 'Georgia, serif',
                backgroundColor: '#f8f9fa', // Soft grey background
              }}
            >
              <Card.Img
                variant="top"
                src={product.imageUrl}
                alt={product.title}
                style={{ objectFit: 'cover', height: '200px' }}
              />
              <Card.Body
                className="d-flex flex-column"
                style={{ paddingBottom: '1cm' }}
              >
                {product.name && (
                  <h6
                    className="text-uppercase small mb-1 fw-bold"
                    style={{ color: '#000' }}
                  >
                    {product.name}
                  </h6>
                )}
                <Card.Title className="fw-semibold">{product.title}</Card.Title>
                <Card.Text className="text-muted small flex-grow-1">
                  {product.description}
                </Card.Text>
                <Button
                  className="btn btn-sm px-4 fw-semibold"
                  style={{
                    backgroundColor: '#B57B5B',
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'Georgia, serif',
                  }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  SHOP NOW
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};



const VisitUsSection = () => {
  const navigate = useNavigate();
  return (
    <Container className="py-4">
      <div
        className="position-relative rounded overflow-hidden"
        style={{ height: '450px' }}
      >
        <img
          src="https://wrish.wpbingosite.com/wp-content/uploads/2021/08/back.jpg"
          alt="Visit Us Banner"
          className="w-100 h-100"
          style={{
            objectFit: 'cover',
            filter: 'brightness(70%)',
            borderRadius: '0.5rem',
          }}
        />
        <div
          className="position-absolute start-50 translate-middle-x text-center text-white px-3"
          style={{
            bottom: '40px',
            transform: 'translateX(-50%)',
          }}
        >
          <h2 className="display-6 fw-bold fst-italic mb-3">
            Need a closer look?
          </h2>
          <p className="lead fst-italic mb-4">
            Come visit us in store we'd love to help you find your perfect fit.
          </p>
          <Button variant="light" size="lg" className="fw-semibold" onClick={() => navigate('/contact')}>
            Contact Us
          </Button>
        </div>
      </div>
    </Container>
  );
};

const productIds2 = [2,3,4,5];
const FeatureCards2 = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const responses = await Promise.all(
          productIds2.map((id) =>
            getProductById(id).then((res) => ({
              id,
              name: res.data.name,
              title: res.data.title,
              description: res.data.shortdescription,
              imageUrl: res.data.imageURL,
            }))
          )
        );
        setProducts(responses);
      } catch (err) {
        console.error('Error fetching product data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="secondary" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      <Row className="g-4">
        {products.map((product) => (
          <Col md={3} key={product.id}>
            <Card
              className="h-100 shadow-sm"
              style={{
                fontFamily: 'Georgia, serif',
                backgroundColor: '#f8f9fa', // Light grey to match Visit Us
              }}
            >
              <Card.Img
                variant="top"
                src={product.imageUrl}
                alt={product.title}
                style={{ objectFit: 'cover', height: '200px' }}
              />
              <Card.Body
                className="d-flex flex-column"
                style={{ paddingBottom: '1cm' }}
              >
                {product.name && (
                  <h6
                    className="text-uppercase small mb-1 fw-bold"
                    style={{ color: '#000' }}
                  >
                    {product.name}
                  </h6>
                )}
                <Card.Title className="fw-semibold">{product.title}</Card.Title>
                <Card.Text className="text-muted small flex-grow-1">
                  {product.description}
                </Card.Text>
                <Button
                  className="btn btn-sm px-4 fw-semibold mt-auto"
                  style={{
                    backgroundColor: '#B57B5B',
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'Georgia, serif',
                  }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  SHOP NOW
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};



const ProductShowcaseCarousel = () => {
  const [imageURL, setImageUrl] = useState('');
  const navigate = useNavigate();

  const productDetails = {
    id: 5,
    title: 'The Meridian Timepiece',
    description:
      'Meticulously engineered for those who value every second, this watch blends timeless sophistication with cutting-edge precision. From its polished bezel to its finely crafted dial, every detail speaks of craftsmanship and character. Whether worn at the boardroom or the ballroom, it transitions seamlessly, pairing utility with undeniable style. Water-resistant, durable, and effortlessly elegant—it’s not just a watch, its a symbol of moments',
    warranty: '2 Year International',
    extras: 'Free Gift Box',
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await getProductById(productDetails.id);
        setImageUrl(res.data.imageURL);
      } catch (err) {
        console.error('Error fetching product image:', err);
      }
    };

    fetchImage();
  }, []);

  return (
    <Container
      fluid="md"
      className="py-5"
      style={{ minHeight: '600px', fontFamily: 'Georgia, serif' }}
    >
      <Carousel controls={false} indicators={false} fade>
        <Carousel.Item>
          <div className="d-flex flex-wrap align-items-start bg-light rounded shadow p-5">
            {/* Text Section */}
            <div
              className="col-md-7 d-flex flex-column justify-content-between"
              style={{ paddingRight: '2rem' }} // Adds space before the image
            >
              <div>
                <h2 className="fw-bold display-6 mb-3" style={{ color: '#000' }}>
                  {productDetails.title}
                </h2>
                <p
                  className="text-muted"
                  style={{
                    textAlign: 'justify',
                    fontSize: '1.05rem',
                    lineHeight: '1.75',
                    marginBottom: '1.5rem',
                  }}
                >
                  {productDetails.description}
                </p>
                <div className="d-flex align-items-center mb-2 text-secondary">
                  <FaShieldAlt className="me-2 text-success" />
                  <span>
                    <strong>Warranty:</strong> {productDetails.warranty}
                  </span>
                </div>
                <div className="d-flex align-items-center mb-4 text-secondary">
                  <FaGift className="me-2 text-warning" />
                  <span>
                    <strong>Extras:</strong> {productDetails.extras}
                  </span>
                </div>
              </div>
              <Button
                className="fw-semibold py-1 px-3 mt-2"
                style={{
                  width: 'fit-content',
                  backgroundColor: '#B57B5B',
                  border: 'none',
                  color: '#fff',
                  fontFamily: 'Georgia, serif',
                }}
                onClick={() => navigate(`/product/${productDetails.id}`)}
              >
                Purchase
              </Button>
            </div>

            {/* Image Section - right-aligned */}
            <div className="col-md-5 d-flex justify-content-end">
              <img
                src={imageURL}
                alt={productDetails.title}
                className="img-fluid rounded shadow-sm"
                style={{ objectFit: 'cover', height: '400px', width: '100%' }}
              />
            </div>
          </div>
        </Carousel.Item>
      </Carousel>
    </Container>
  );
};



const ShopByCategory = () => {
  const navigate = useNavigate();
return(
  <div className="container my-4">
    <Row className="g-4">
      {/* Shop for Men */}
      <Col md={6}>
        <div className="card text-white position-relative overflow-hidden border-0 rounded shadow-sm">
          <img
            src="https://i.pinimg.com/736x/be/51/b5/be51b5110cb9caed7cc3033d4d50d1c4.jpg"
            alt="Shop Men"
            className="card-img"
            style={{ objectFit: 'cover', height: '400px' }}
          />
          <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1 }}/>
          {/* Overlay behind content */}
          <div
            className="position-absolute bottom-0 start-0 w-100 ps-4 pe-4"
            style={{
                paddingBottom: '3rem',
                zIndex: 2,
                color: '#fff',
            }}
          >
            <h3 className="fw-bold display-6 mb-2">Shop for Men</h3>
            <Button style={{
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    fontWeight: '600',
  }}onClick={() => navigate('/products?gender=Men')}>
              Explore
            </Button>

           
          </div>
        </div>
      </Col>

      {/* Shop for Women */}
      <Col md={6}>
        <div className="card text-white position-relative overflow-hidden border-0 rounded shadow-sm">
          <img
            src="https://i.pinimg.com/736x/c2/d5/fe/c2d5fe51a46ec4929696babe76a8e455.jpg"
            alt="Shop Women"
            className="card-img"
            style={{ objectFit: 'cover', height: '400px' }}
          />
          <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1 }}/>
          {/* Overlay behind content */}
          <div
            className="position-absolute bottom-0 start-0 w-100 ps-4 pe-4"
            style={{
                paddingBottom: '3rem',
                zIndex: 2,
                color: '#fff',
            }}
          >
            
            <h3 className="fw-bold display-6 mb-2">Shop for Women</h3>
            <Button style={{
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    fontWeight: '600',
  }} onClick={() => navigate('/products?gender=Women')}>
              Explore
            </Button>
          </div>
        </div>
      </Col>
    </Row>
  </div>
);
};

const AboutUsSection = () => {
  // Define keyframes for left-to-right fade-in animation
  const keyframes = `
    @keyframes fadeSlideLeft {
      0% {
        transform: translateX(-40px);
        opacity: 0;
      }
      100% {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>

      <div
        id="about"
        className="container my-4"
        style={{ marginBottom: '80px', fontFamily: 'Georgia, serif' }}
      >
        <div
          className="rounded shadow-sm"
          style={{ backgroundColor: '#f8f9fa', padding: '2rem' }}
        >
          <Row className="align-items-center g-4">
            <Col md={6}>
              <h2
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#000',
                  whiteSpace: 'nowrap',
                  animation: 'fadeSlideLeft 1.5s ease-out 0s 2',
                  overflow: 'hidden',
                  paddingTop: '10px',
                  paddingLeft: '5px',
                  marginBottom: '2rem',
                }}
              >
                ZYLO: Crafted for Moments
              </h2>
              <p
                className="text-muted mt-3"
                style={{
                  textAlign: 'justify',
                  paddingRight: '50px',
                  paddingLeft: '20px',
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                }}
              >
                Every Zylo timepiece is designed to honor the elegance of your moments—blending timeless design with precision craftsmanship that resonates with refined living. Inspired by the beauty of everyday rituals and extraordinary celebrations, each piece reflects a legacy of artistry that stands the test of time.
              </p>
            </Col>

            <Col md={6}>
              <img
                src="https://i.pinimg.com/736x/ff/70/5f/ff705f423ca8581c83dc5f1841383eb1.jpg"
                alt="About Zylo"
                className="img-fluid rounded shadow"
                style={{ height: '400px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};


const HomePage = () => (
  <div>
    {/* Navbar spacing */}
    
    <HeroCarousel />
    <FeatureHighlights />
    <SectionHeading1 text="Catch the First Tick" />
    <FeatureCards1 />
    <VisitUsSection />
    <SectionHeading1 text="Timeless Classics" />
    <FeatureCards2 />
    <AboutUsSection />
    <div style={{ height: '4rem' }}></div>
    <ShopByCategory />
    <ProductShowcaseCarousel />
  </div>
);

export default HomePage;
