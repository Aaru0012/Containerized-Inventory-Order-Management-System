import React from 'react';
import { Package, Users, ShoppingCart, AlertTriangle, ArrowRight, Plus } from 'lucide-react';

export default function Dashboard({ summary, loading, error, setActiveView }) {
  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <div className="alert-message">Failed to load dashboard data: {error}</div>
      </div>
    );
  }

  const { total_products = 0, total_customers = 0, total_orders = 0, low_stock_products = [] } = summary || {};

  return (
    <div>
      <div className="panel-header" style={{ marginBottom: '2rem' }}>
        <div className="panel-title-wrapper">
          <h1>Business Overview</h1>
          <p className="panel-subtitle">Real-time inventory levels, customer metrics, and sales summary.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-grid">
        <div className="kpi-card" onClick={() => setActiveView('products')}>
          <div className="kpi-icon-wrapper">
            <Package size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Products</span>
            <span className="kpi-value">{total_products}</span>
          </div>
        </div>

        <div className="kpi-card purple" onClick={() => setActiveView('customers')}>
          <div className="kpi-icon-wrapper">
            <Users size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Customers</span>
            <span className="kpi-value">{total_customers}</span>
          </div>
        </div>

        <div className="kpi-card cyan" onClick={() => setActiveView('orders')}>
          <div className="kpi-icon-wrapper">
            <ShoppingCart size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Orders</span>
            <span className="kpi-value">{total_orders}</span>
          </div>
        </div>

        <div className="kpi-card warning" onClick={() => setActiveView('products')}>
          <div className="kpi-icon-wrapper">
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Low Stock</span>
            <span className="kpi-value">{low_stock_products.length}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Low Stock Panel */}
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-header">
            <div className="panel-title-wrapper">
              <h3>Low Stock Alert</h3>
              <p className="panel-subtitle">Products with inventory below the reorder threshold (5 items).</p>
            </div>
            {low_stock_products.length > 0 && (
              <span className="badge badge-danger">
                {low_stock_products.length} Items
              </span>
            )}
          </div>

          {low_stock_products.length === 0 ? (
            <div style={{ padding: '1.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              🎉 All products are adequately stocked! No warnings.
            </div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>In Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {low_stock_products.map((product) => (
                    <tr key={product.id}>
                      <td style={{ fontWeight: 500, color: '#ffffff' }}>{product.name}</td>
                      <td><code>{product.sku}</code></td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>
                        <span className="badge badge-danger" style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                          <AlertTriangle size={12} /> {product.quantity} left
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-header">
            <div className="panel-title-wrapper">
              <h3>Quick Actions</h3>
              <p className="panel-subtitle">Common operations and workflows.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', padding: '1rem 1.25rem' }}
              onClick={() => setActiveView('products')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Plus size={18} className="sidebar-logo" />
                Manage Products
              </span>
              <ArrowRight size={16} />
            </button>

            <button 
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', padding: '1rem 1.25rem' }}
              onClick={() => setActiveView('customers')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Plus size={18} className="sidebar-logo" style={{ color: 'var(--accent-purple)' }} />
                Manage Customers
              </span>
              <ArrowRight size={16} />
            </button>

            <button 
              className="btn btn-primary" 
              style={{ justifyContent: 'space-between', padding: '1rem 1.25rem' }}
              onClick={() => setActiveView('orders')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShoppingCart size={18} />
                Create New Order
              </span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
