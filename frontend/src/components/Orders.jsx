import React, { useState } from 'react';
import { ShoppingCart, Search, Plus, Trash2, X, Eye, Calendar, DollarSign, User, Mail, Phone, List } from 'lucide-react';

export default function Orders({ orders, products, customers, loading, error, onCreate, onDelete, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form States for creating a new order
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([]); // Array of { product_id, quantity, product }
  
  // Temporary builder states for adding single item to current draft order
  const [builderProductId, setBuilderProductId] = useState('');
  const [builderQuantity, setBuilderQuantity] = useState('1');
  
  const [formErrors, setFormErrors] = useState({});
  const [actionError, setActionError] = useState('');

  // Find active product matching the builder selection to show stock limit info
  const selectedProductInfo = products.find(p => p.id === parseInt(builderProductId));

  // Search filter for orders list
  const filteredOrders = orders.filter(order => {
    const customerName = order.customer?.name.toLowerCase() || '';
    const orderId = order.id.toString();
    return customerName.includes(searchTerm.toLowerCase()) || orderId.includes(searchTerm);
  });

  // Calculate draft order total dynamically
  const runningTotal = orderItems.reduce((acc, item) => {
    return acc + (item.product.price * item.quantity);
  }, 0);

  // Add Item to draft list
  const handleAddItem = (e) => {
    e.preventDefault();
    setFormErrors({ ...formErrors, items: '' });
    
    if (!builderProductId) {
      setFormErrors({ ...formErrors, builderProduct: 'Please select a product' });
      return;
    }

    const qty = parseInt(builderQuantity);
    if (isNaN(qty) || qty <= 0) {
      setFormErrors({ ...formErrors, builderQuantity: 'Quantity must be greater than 0' });
      return;
    }

    // Verify stock availability
    if (selectedProductInfo.quantity < qty) {
      setFormErrors({
        ...formErrors,
        builderQuantity: `Only ${selectedProductInfo.quantity} units available in stock.`
      });
      return;
    }

    // Check if product already exists in draft list
    const existingIndex = orderItems.findIndex(item => item.product_id === selectedProductInfo.id);
    if (existingIndex > -1) {
      const newQty = orderItems[existingIndex].quantity + qty;
      if (selectedProductInfo.quantity < newQty) {
        setFormErrors({
          ...formErrors,
          builderQuantity: `Combined quantity (${newQty}) exceeds stock limit of ${selectedProductInfo.quantity}.`
        });
        return;
      }
      const updatedItems = [...orderItems];
      updatedItems[existingIndex].quantity = newQty;
      setOrderItems(updatedItems);
    } else {
      setOrderItems([...orderItems, {
        product_id: selectedProductInfo.id,
        quantity: qty,
        product: selectedProductInfo
      }]);
    }

    // Reset item selector
    setBuilderProductId('');
    setBuilderQuantity('1');
  };

  // Remove Item from draft list
  const handleRemoveItem = (index) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  // Submit Order Creation
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    const errors = {};

    if (!selectedCustomerId) {
      errors.customer = 'Please select a customer';
    }

    if (orderItems.length === 0) {
      errors.items = 'Please add at least one product item to the order';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      customer_id: parseInt(selectedCustomerId),
      items: orderItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    };

    try {
      const success = await onCreate(payload);
      if (success) {
        // Reset states
        setSelectedCustomerId('');
        setOrderItems([]);
        setShowAddForm(false);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to place order.');
    }
  };

  // Handle Cancel/Delete Order
  const handleDeleteOrder = async (id) => {
    if (window.confirm(`Are you sure you want to cancel and delete Order #${id}? Restored items will go back to inventory.`)) {
      setActionError('');
      try {
        await onDelete(id);
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(null);
        }
      } catch (err) {
        setActionError(err.message || 'Failed to cancel order.');
      }
    }
  };

  return (
    <div>
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <h1>Orders & Fulfillment</h1>
          <p className="panel-subtitle">Create orders, review sales transactions, and cancel orders.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-icon" onClick={onRefresh} title="Refresh orders list">
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-primary" onClick={() => {
            setShowAddForm(!showAddForm);
            setSelectedCustomerId('');
            setOrderItems([]);
            setFormErrors({});
            setActionError('');
          }}>
            <Plus size={18} /> Create Order
          </button>
        </div>
      </div>

      {actionError && (
        <div className="alert alert-error">
          <div className="alert-message">{actionError}</div>
        </div>
      )}

      {/* Interactive Order Creation Builder */}
      {showAddForm && (
        <div className="panel" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
          <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
            <h4>Draft New Order</h4>
            <button className="modal-close-btn" onClick={() => setShowAddForm(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="order-builder">
            {/* Left Column: Item Selection Builder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="panel" style={{ background: 'rgba(255,255,255,0.01)', padding: '1.25rem', marginBottom: 0 }}>
                <h5 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <List size={16} style={{ color: 'var(--accent-cyan)' }} />
                  Add Items to Cart
                </h5>
                <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flexGrow: 1, minWidth: '180px' }}>
                    <select
                      value={builderProductId}
                      onChange={(e) => {
                        setBuilderProductId(e.target.value);
                        setFormErrors({ ...formErrors, builderProduct: '' });
                      }}
                      style={{ width: '100%' }}
                    >
                      <option value="">-- Select Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                          {p.name} (${p.price.toFixed(2)}) {p.quantity <= 0 ? ' [OUT OF STOCK]' : ` - In stock: ${p.quantity}`}
                        </option>
                      ))}
                    </select>
                    {formErrors.builderProduct && <span className="error-text">{formErrors.builderProduct}</span>}
                  </div>

                  <div className="form-group" style={{ width: '100px' }}>
                    <input
                      type="number"
                      min="1"
                      value={builderQuantity}
                      onChange={(e) => {
                        setBuilderQuantity(e.target.value);
                        setFormErrors({ ...formErrors, builderQuantity: '' });
                      }}
                      placeholder="Qty"
                    />
                    {formErrors.builderQuantity && <span className="error-text">{formErrors.builderQuantity}</span>}
                  </div>

                  <button type="submit" className="btn btn-secondary" style={{ height: '43px' }}>
                    Add
                  </button>
                </form>

                {selectedProductInfo && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginTop: '0.5rem' }}>
                    💡 SKU: <code>{selectedProductInfo.sku}</code> | Max Available: <strong>{selectedProductInfo.quantity}</strong> units
                  </div>
                )}
              </div>

              {/* Items Cart List */}
              <div>
                <h5 style={{ marginBottom: '0.75rem' }}>Items List</h5>
                {orderItems.length === 0 ? (
                  <div style={{ padding: '2rem', border: '1px dashed var(--border-color)', borderRadius: '12px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No products added to this order draft yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {orderItems.map((item, index) => (
                      <div key={index} className="item-row">
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ fontWeight: 500, color: '#ffffff' }}>{item.product.name}</div>
                          <div style={{ fontSize: '0.8', color: 'var(--color-text-muted)' }}>
                            SKU: <code>{item.product.sku}</code> | Unit price: ${item.product.price.toFixed(2)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600 }}>Qty: {item.quantity}</span>
                          <span style={{ color: 'var(--accent-cyan)', minWidth: '60px', textAlign: 'right', fontWeight: 600 }}>
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                          <button 
                            type="button" 
                            className="btn btn-danger btn-icon btn-sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {formErrors.items && <div className="error-text" style={{ marginTop: '0.5rem' }}>{formErrors.items}</div>}
              </div>
            </div>

            {/* Right Column: Customer & Checkout */}
            <div className="order-summary-box">
              <h5 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Order Fulfillment
              </h5>
              
              <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label>Select Customer</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      setFormErrors({ ...formErrors, customer: '' });
                    }}
                  >
                    <option value="">-- Select Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                  {formErrors.customer && <span className="error-text">{formErrors.customer}</span>}
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <div className="order-summary-row">
                    <span>Selected items count:</span>
                    <span>{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="order-summary-row total">
                    <span>Order Total:</span>
                    <span>${runningTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent-cyan) 0%, #0891b2 100%)', boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)' }}>
                    Place Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table Panel */}
      <div className="panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', alignItems: 'center' }}>
          <div className="search-bar">
            <Search size={18} className="sidebar-logo" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by customer name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
        </div>

        {loading && orders.length === 0 ? (
          <div className="spinner-wrapper">
            <div className="spinner"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart className="empty-state-icon" />
            <h4 className="empty-state-title">No Orders Placed</h4>
            <p className="empty-state-desc">Establish products and customers, then click 'Create Order' above.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Profile</th>
                  <th>Total Amount</th>
                  <th>Date Placed</th>
                  <th>Unique Items</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td><code>#ORD-{order.id.toString().padStart(4, '0')}</code></td>
                    <td style={{ color: '#ffffff', fontWeight: 500 }}>{order.customer?.name || 'Unknown'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>${order.total_amount.toFixed(2)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary btn-icon btn-sm" 
                          onClick={() => setSelectedOrder(order)}
                          title="View order invoice detail"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="btn btn-danger btn-icon btn-sm" 
                          onClick={() => handleDeleteOrder(order.id)}
                          title="Cancel order"
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

      {/* View Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div>
                <h3>Order Invoice Detail</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  ID: #ORD-{selectedOrder.id.toString().padStart(4, '0')}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Header Info Block */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Date Placed</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                    <Calendar size={14} style={{ color: 'var(--accent-cyan)' }} />
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Total Cost</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    <DollarSign size={14} />
                    {selectedOrder.total_amount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Customer Profile Block */}
              <div>
                <h5 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} style={{ color: 'var(--accent-purple)' }} />
                  Customer Details
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#ffffff' }}>{selectedOrder.customer?.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    <Mail size={12} />
                    {selectedOrder.customer?.email}
                  </div>
                  {selectedOrder.customer?.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                      <Phone size={12} />
                      {selectedOrder.customer?.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Items List Table */}
              <div>
                <h5 style={{ marginBottom: '0.75rem' }}>Items Ordered</h5>
                <div className="table-responsive">
                  <table style={{ fontSize: '0.9rem' }}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th style={{ textAlign: 'center' }}>Qty</th>
                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div style={{ fontWeight: 500, color: '#ffffff' }}>{item.product?.name || 'Deleted Product'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              SKU: <code>{item.product?.sku || 'N/A'}</code>
                            </div>
                          </td>
                          <td>${item.price_at_order.toFixed(2)}</td>
                          <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#ffffff' }}>
                            ${(item.price_at_order * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                >
                  Cancel Order & Restore Stock
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close Detail View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
