import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

//gets the empty div<id=root> from index.html and specifies we will inject the code react code here
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  //helps catch bugs
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

//useful while sending the performance data like google analytics
reportWebVitals();
