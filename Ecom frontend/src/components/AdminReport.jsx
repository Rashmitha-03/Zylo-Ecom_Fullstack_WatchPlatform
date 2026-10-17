import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Spinner, Row, Col } from 'react-bootstrap';
import {
  fetchProductFrequencyStats,
  fetchGenderFrequencyStats,
  getProductById
} from '../services/adminService';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminReport = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [genderStats, setGenderStats] = useState({});
  const [productDetails, setProductDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchProductFrequencyStats();
        const statsData = response.data;
        setStats(statsData);

        const genderResponse = await fetchGenderFrequencyStats();
        setGenderStats(genderResponse.data);

        const detailMap = {};
        const productIDs = Object.keys(statsData);

        for (const id of productIDs) {
          try {
            const product = await getProductById(parseInt(id));
            detailMap[id] = product.data;
          } catch (err) {
            console.error(`Failed to fetch product info for ID ${id}`, err);
          }
        }

        setProductDetails(detailMap);
      } catch (err) {
        console.error('Error loading report data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBack = () => navigate('/');

  const handleDownloadPDF = () => {
    const input = document.getElementById('report-content');
    html2canvas(input, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('AdminReport.pdf');
    });
  };

  const getBestSellingProduct = (timeframe) => {
    let maxProductId = null;
    let maxCount = 0;

    for (const [productId, data] of Object.entries(stats)) {
      if (data[timeframe] > maxCount) {
        maxCount = data[timeframe];
        maxProductId = productId;
      }
    }

    if (maxProductId) {
      const product = productDetails[maxProductId];
      return {
        name: product?.name || `${maxProductId}`,
        orders: maxCount
      };
    }

    return null;
  };

  return (
    <div className="container px-5" style={{ paddingTop: '6rem', paddingBottom: '2rem', fontFamily: 'Georgia, serif' }}>
      <style>{`
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

      {/* Action Buttons */}
      {/* Action Buttons */}
<div className="d-flex justify-content-between align-items-center mb-3">
  <button onClick={handleBack} className="btn btn-sm btn-brown">
    <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
  </button>
  <button onClick={handleDownloadPDF} className="btn btn-sm btn-brown">
    <i className="bi bi-download me-2"></i>Download PDF
  </button>
</div>


      {/* 📄 Report Content */}
      <div id="report-content">
        <h2 className="text-center mb-4" style={{ color: 'black' }}>📊 Order Summary Report</h2>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="secondary" />
          </div>
        ) : (
          <>
            {/* Summary Table */}
            <h5 className="mb-3">🧾 Product Order Summary Table</h5>
            <div className="table-responsive mb-5">
              <Table striped bordered hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Product Name</th>
                    <th>Orders this Week</th>
                    <th>Orders this Month</th>
                    <th>Orders this Year</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats).map(([productId, data]) => (
                    <tr key={productId}>
                      <td>{productDetails[productId]?.name || `${productId}`}</td>
                      <td>{data.week}</td>
                      <td>{data.month}</td>
                      <td>{data.year}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Gender-wise Pie Charts */}
            <h5 className="mb-3">🧬 Gender-wise Order Distribution</h5>
            <Row className="mb-5">
  {['week', 'month', 'year'].map((timeframe) => {
    const labels = Object.keys(genderStats);
    const dataValues = Object.values(genderStats).map(g => g[timeframe]);

    const data = {
      labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: ['#B57B5B', '#A47148', '#d2b48c'],
          borderColor: '#fff',
          borderWidth: 1
        }
      ]
    };

    return (
      <Col md={4} key={timeframe} className="mb-4">
        <h6 className="text-center">{timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}</h6>
        <Pie data={data} />
        <div className="mt-3 text-center">
          {labels.map((label, index) => (
            <div key={label}>
              <strong>{label}:</strong> {dataValues[index]}
            </div>
          ))}
        </div>
      </Col>
    );
  })}
</Row>


            {/* Best Sellers */}
            <h5 className="mb-3">🏆 Best-Selling Products</h5>
            <Row>
              {['week', 'month', 'year'].map((frame) => {
                const best = getBestSellingProduct(frame);
                return best ? (
                  <Col md={4} key={frame} className="mb-4">
                    <div className="card h-100 shadow text-center p-3">
                      <h6 className="mb-2">{frame.charAt(0).toUpperCase() + frame.slice(1)}</h6>
                      <p className="fw-bold mb-1">{best.name}</p>
                      <p className="mb-0">🛒 Orders: {best.orders}</p>
                    </div>
                  </Col>
                ) : (
                  <Col md={4} key={frame} className="mb-4">
                    <div className="card h-100 shadow text-center p-3">
                      <h6 className="mb-2">{frame.charAt(0).toUpperCase() + frame.slice(1)}</h6>
                      <p className="text-muted">No data available</p>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReport;
