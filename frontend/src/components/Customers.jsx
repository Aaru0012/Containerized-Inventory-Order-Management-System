import React, { useState } from 'react';
import { Users, Search, Plus, Trash2, X, RefreshCw } from 'lucide-react';

export default function Customers({ customers, loading, error, onCreate, onDelete, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [formErrors, setFormErrors] = useState({});
  const [actionError, setActionError] = useState('');

  // Search Filter
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (!formData.name.trim()) errors.name = 'Full name is required';
    
    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      errors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        errors.email = 'Please enter a valid email address structure';
      }
    }
    
    return errors;
  };

  // Submit Add Customer
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
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null
      });
      if (success) {
        setFormData({ name: '', email: '', phone: '' });
        setShowAddForm(false);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to create customer record.');
    }
  };

  // Handle Delete
  const handleDelete = async (id, name) => {
    const doubleConfirm = window.confirm(
      `⚠️ WARNING: Deleting customer "${name}" will permanently cancel and delete all of their orders!\n\n` +
      `Are you sure you want to proceed?`
    );
    
    if (doubleConfirm) {
      setActionError('');
      try {
        await onDelete(id);
      } catch (err) {
        setActionError(err.message || 'Failed to delete customer.');
      }
    }
  };

  return (
    <div>
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <h1>Customer Contacts</h1>
          <p className="panel-subtitle">Manage customer profile accounts and contact options.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-icon" onClick={onRefresh} title="Refresh customer database">
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-primary" onClick={() => {
            setShowAddForm(!showAddForm);
            setFormData({ name: '', email: '', phone: '' });
            setFormErrors({});
            setActionError('');
          }}>
            <Plus size={18} /> Add Customer
          </button>
        </div>
      </div>

      {actionError && (
        <div className="alert alert-error">
          <div className="alert-message">{actionError}</div>
        </div>
      )}

      {/* Add Customer Panel */}
      {showAddForm && (
        <div className="panel" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
          <div className="panel-header" style={{ marginBottom: '1rem' }}>
            <h4>Add Customer Record</h4>
            <button className="modal-close-btn" onClick={() => setShowAddForm(false)}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleAddSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Alice Smith"
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. alice@example.com"
                />
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
              </div>

              <div className="form-group">
                <label>Phone Number (Optional)</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +1 (555) 019-2834"
                />
              </div>
            </div>
            <div className="form-actions" style={{ marginTop: 0, paddingTo: 0 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, var(--accent-purple) 0%, #7c3aed 100%)', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)' }}>
                Save Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer Listing Table */}
      <div className="panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', alignItems: 'center' }}>
          <div className="search-bar">
            <Search size={18} className="sidebar-logo" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Showing {filteredCustomers.length} of {customers.length} customers
          </span>
        </div>

        {loading && customers.length === 0 ? (
          <div className="spinner-wrapper">
            <div className="spinner"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <Users className="empty-state-icon" />
            <h4 className="empty-state-title">No Customers Found</h4>
            <p className="empty-state-desc">Try searching or register a new customer above.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td style={{ color: '#ffffff', fontWeight: 500 }}>{customer.name}</td>
                    <td><code>{customer.email}</code></td>
                    <td>{customer.phone ? customer.phone : <span style={{ color: 'rgba(255,255,255,0.15)', fontStyle: 'italic' }}>Not provided</span>}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-danger btn-icon btn-sm" 
                        onClick={() => handleDelete(customer.id, customer.name)}
                        title="Delete customer profile"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
