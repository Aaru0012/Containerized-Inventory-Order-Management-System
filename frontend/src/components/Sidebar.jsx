import React from 'react';
import { LayoutDashboard, Package, Users, ShoppingCart, Menu, X } from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, mobileMenuOpen, setMobileMenuOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart }
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <div className="sidebar-brand" style={{ marginBottom: 0 }}>
          <Package className="sidebar-logo" size={24} />
          <span className="sidebar-title">Apex Stock</span>
        </div>
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Drawer */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Package className="sidebar-logo" size={28} />
          <span className="sidebar-title">Apex Stock</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <a
                key={item.id}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileMenuOpen(false);
                }}
              >
                <Icon className="nav-link-icon" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p>© 2026 Apex Stock Inc.</p>
          <p style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.6 }}>v1.0.0 (Stable)</p>
        </div>
      </aside>
    </>
  );
}
