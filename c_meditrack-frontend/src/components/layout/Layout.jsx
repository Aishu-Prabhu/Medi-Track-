// src/components/layout/Layout.jsx
//Main layout wrapper
import React from 'react';
import Navbar from './Navbar';

function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Navbar />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        {children}
      </main>
    </div>
  );
}

export default Layout;