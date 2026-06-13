import React, { useState } from 'react';
import { Package, Search, Plus, Trash2, Edit2, X, RefreshCw } from 'lucide-react';

export default function Products({ products, loading, error, onCreate, onUpdate, onDelete, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form States
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [formErrors, setFormErrors] = useState({});
  const [actionError, setActionError] = useState('');

  // Search Filter
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Form Input Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.sku.trim()) errors.sku = 'SKU is required';
    
    const priceVal = parseFloat(formData.price);
    if (isNaN(priceVal) || priceVal < 0) {
      errors.price = 'Price must be a number greater than or equal to 0';
    }
    
    const qtyVal = parseInt(formData.quantity);
    if (isNaN(qtyVal) || qtyVal < 0) {
      errors.quantity = 'Quantity must be a non-negative integer';
    }
    return errors;
  };

  // Submit Add Product
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const success = await onCreate({
        name: formData.name.trim(),
        sku: formData.sku.toUpperCase().trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      });
      if (success) {
        setFormData({ name: '', sku: '', price: '', quantity: '' });
        setShowAddForm(false);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to create product.');
    }
  };

  // Trigger Edit Modal
  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      quantity: product.quantity.toString()
    });
    setFormErrors({});
    setActionError('');
  };

  // Submit Edit Product
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const success = await onUpdate(editingProduct.id, {
        name: formData.name.trim(),
        sku: formData.sku.toUpperCase().trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      });
      if (success) {
        setEditingProduct(null);
        setFormData({ name: '', sku: '', price: '', quantity: '' });
      }
    } catch (err) {
      setActionError(err.message || 'Failed to update product.');
    }
  };

  // Handle Delete
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      setActionError('');
      try {
        await onDelete(id);
      } catch (err) {
        setActionError(err.message || 'Failed to delete product.');
      }
    }
  };

  return (
    <div>
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <h1>Product Catalog</h1>
          <p className="panel-subtitle">Manage items, tracking codes (SKU), prices, and stock numbers.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-icon" onClick={onRefresh} title="Refresh catalog">
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-primary" onClick={() => {
            setShowAddForm(!showAddForm);
            setFormData({ name: '', sku: '', price: '', quantity: '' });
            setFormErrors({});
            setActionError('');
          }}>
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {actionError && (
        <div className="alert alert-error">
          <div className="alert-message">{actionError}</div>
        </div>
      )}

      {/* Add Product Panel */}
      {showAddForm && (
        <div className="panel" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="panel-header" style={{ marginBottom: '1rem' }}>
            <h4>Create New Product</h4>
            <button className="modal-close-btn" onClick={() => setShowAddForm(false)}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleAddSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Dell XPS 15 Laptop"
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label>SKU / Product Code</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="e.g. DELL-XPS-001"
                />
                {formErrors.sku && <span className="error-text">{formErrors.sku}</span>}
              </div>

              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
                {formErrors.price && <span className="error-text">{formErrors.price}</span>}
              </div>

              <div className="form-group">
                <label>Quantity in Stock</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                />
                {formErrors.quantity && <span className="error-text">{formErrors.quantity}</span>}
              </div>
            </div>
            <div className="form-actions" style={{ marginTop: 0, paddingTo: 0 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog Listing Table */}
      <div className="panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', alignItems: 'center' }}>
          <div className="search-bar">
            <Search size={18} className="sidebar-logo" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Showing {filteredProducts.length} of {products.length} products
          </span>
        </div>

        {loading && products.length === 0 ? (
          <div className="spinner-wrapper">
            <div className="spinner"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <Package className="empty-state-icon" />
            <h4 className="empty-state-title">No Products Found</h4>
            <p className="empty-state-desc">Try search keywords or create a new product above.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>SKU Code</th>
                  <th>Unit Price</th>
                  <th>Stock Levels</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td style={{ color: '#ffffff', fontWeight: 500 }}>{product.name}</td>
                    <td><code>{product.sku}</code></td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      {product.quantity === 0 ? (
                        <span className="badge badge-danger">Out of Stock</span>
                      ) : product.quantity < 5 ? (
                        <span className="badge badge-warning">Low Stock ({product.quantity})</span>
                      ) : (
                        <span className="badge badge-success">In Stock ({product.quantity})</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary btn-icon btn-sm" 
                          onClick={() => startEdit(product)}
                          title="Edit details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="btn btn-danger btn-icon btn-sm" 
                          onClick={() => handleDelete(product.id, product.name)}
                          title="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Edit Product Details</h3>
              <button className="modal-close-btn" onClick={() => setEditingProduct(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label>SKU / Product Code</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                    />
                    {formErrors.sku && <span className="error-text">{formErrors.sku}</span>}
                  </div>

                  <div className="form-group">
                    <label>Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                    {formErrors.price && <span className="error-text">{formErrors.price}</span>}
                  </div>

                  <div className="form-group">
                    <label>Quantity in Stock</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                    />
                    {formErrors.quantity && <span className="error-text">{formErrors.quantity}</span>}
                  </div>
                </div>

                {actionError && (
                  <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                    <div className="alert-message">{actionError}</div>
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingProduct(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Details
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
