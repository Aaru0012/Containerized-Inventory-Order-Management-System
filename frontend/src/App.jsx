import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Customers from './components/Customers';
import Orders from './components/Orders';

// Dynamically determine the backend API URL.
// Falls back to http://localhost:8000 for local development if VITE_API_URL is not provided.
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin);

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data States
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);

  // Loading & Error States
  const [loading, setLoading] = useState({
    products: false,
    customers: false,
    orders: false,
    summary: false
  });
  const [errors, setErrors] = useState({
    products: '',
    customers: '',
    orders: '',
    summary: ''
  });

  // Success Notification Banner State
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch helper to wrap API calls
  const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      let message = 'An error occurred';
      try {
        const errorData = await response.json();
        message = errorData.detail || errorData.message || message;
      } catch (e) {
        message = response.statusText || message;
      }
      throw new Error(message);
    }

    return response.json();
  };

  // --- Fetch Methods ---
  const loadDashboardSummary = async () => {
    setLoading(prev => ({ ...prev, summary: true }));
    setErrors(prev => ({ ...prev, summary: '' }));
    try {
      const data = await apiCall('/dashboard/summary');
      setSummary(data);
    } catch (err) {
      setErrors(prev => ({ ...prev, summary: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const loadProducts = async () => {
    setLoading(prev => ({ ...prev, products: true }));
    setErrors(prev => ({ ...prev, products: '' }));
    try {
      const data = await apiCall('/products');
      setProducts(data);
    } catch (err) {
      setErrors(prev => ({ ...prev, products: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const loadCustomers = async () => {
    setLoading(prev => ({ ...prev, customers: true }));
    setErrors(prev => ({ ...prev, customers: '' }));
    try {
      const data = await apiCall('/customers');
      setCustomers(data);
    } catch (err) {
      setErrors(prev => ({ ...prev, customers: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  };

  const loadOrders = async () => {
    setLoading(prev => ({ ...prev, orders: true }));
    setErrors(prev => ({ ...prev, orders: '' }));
    try {
      const data = await apiCall('/orders');
      setOrders(data);
    } catch (err) {
      setErrors(prev => ({ ...prev, orders: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  // Initial Load & State Synchronization
  useEffect(() => {
    loadDashboardSummary();
    loadProducts();
    loadCustomers();
    loadOrders();
  }, []);

  // Sync helper when any write operation occurs
  const syncState = () => {
    loadDashboardSummary();
    loadProducts();
    loadCustomers();
    loadOrders();
  };

  // --- Product CRUD Actions ---
  const handleCreateProduct = async (productData) => {
    try {
      await apiCall('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
      setSuccessMessage(`Product "${productData.name}" created successfully.`);
      syncState();
      return true;
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateProduct = async (id, productData) => {
    try {
      await apiCall(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
      setSuccessMessage(`Product "${productData.name}" updated successfully.`);
      syncState();
      return true;
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const deleted = await apiCall(`/products/${id}`, { method: 'DELETE' });
      setSuccessMessage(`Product "${deleted.name}" deleted from database.`);
      syncState();
      return true;
    } catch (err) {
      throw err;
    }
  };

  // --- Customer Actions ---
  const handleCreateCustomer = async (customerData) => {
    try {
      await apiCall('/customers', {
        method: 'POST',
        body: JSON.stringify(customerData)
      });
      setSuccessMessage(`Customer account "${customerData.name}" registered.`);
      syncState();
      return true;
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteCustomer = async (id) => {
    try {
      const deleted = await apiCall(`/customers/${id}`, { method: 'DELETE' });
      setSuccessMessage(`Customer profile "${deleted.name}" has been removed.`);
      syncState();
      return true;
    } catch (err) {
      throw err;
    }
  };

  // --- Order Actions ---
  const handleCreateOrder = async (orderPayload) => {
    try {
      const placed = await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });
      setSuccessMessage(`Order #${placed.id} has been successfully created.`);
      syncState();
      return true;
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await apiCall(`/orders/${id}`, { method: 'DELETE' });
      setSuccessMessage(`Order #${id} cancelled. Stock restored to inventory.`);
      syncState();
      return true;
    } catch (err) {
      throw err;
    }
  };

  // Render active view screen
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            summary={summary} 
            loading={loading.summary} 
            error={errors.summary}
            setActiveView={setActiveView}
          />
        );
      case 'products':
        return (
          <Products 
            products={products}
            loading={loading.products}
            error={errors.products}
            onCreate={handleCreateProduct}
            onUpdate={handleUpdateProduct}
            onDelete={handleDeleteProduct}
            onRefresh={loadProducts}
          />
        );
      case 'customers':
        return (
          <Customers
            customers={customers}
            loading={loading.customers}
            error={errors.customers}
            onCreate={handleCreateCustomer}
            onDelete={handleDeleteCustomer}
            onRefresh={loadCustomers}
          />
        );
      case 'orders':
        return (
          <Orders 
            orders={orders}
            products={products}
            customers={customers}
            loading={loading.orders || loading.products || loading.customers}
            error={errors.orders}
            onCreate={handleCreateOrder}
            onDelete={handleDeleteOrder}
            onRefresh={syncState}
          />
        );
      default:
        return <div>View not found.</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Main Workspace Layout */}
      <main className="main-content">
        {/* Success Alert Banner Toast */}
        {successMessage && (
          <div className="alert alert-success" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="alert-message">{successMessage}</div>
          </div>
        )}

        {renderActiveView()}
      </main>
    </div>
  );
}
