// src/components/common/Spinner.jsx
import React from 'react';

function Spinner({ size = 40 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
      <div
        style={{
          width: size,
          height: size,
          border: '4px solid #e0e0e0',
          borderTopColor: '#2196F3',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Spinner;