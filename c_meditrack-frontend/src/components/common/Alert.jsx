// src/components/common/Alert.jsx
import React from 'react';

const STYLES = {
  success: { background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7' },
  error:   { background: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a' },
  info:    { background: '#e3f2fd', color: '#1565c0', border: '1px solid #90caf9' },
  warning: { background: '#fff8e1', color: '#f57f17', border: '1px solid #ffe082' },
};

function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;

  // Safely convert message to renderable text
  let displayMessage = '';

  if (typeof message === 'string') {
    displayMessage = message;
  } else if (typeof message === 'number') {
    displayMessage = String(message);
  } else if (Array.isArray(message)) {
    displayMessage = message.join(', ');
  } else if (typeof message === 'object') {
    if (message.message) {
      displayMessage = message.message;
    } else {
      displayMessage = Object.values(message).join(', ');
    }
  } else {
    displayMessage = 'Something went wrong';
  }

  return (
    <div
      style={{
        ...STYLES[type],
        padding: '12px 16px',
        borderRadius: '6px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
      }}
    >
      <span>{displayMessage}</span>

      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            color: 'inherit',
            marginLeft: '12px',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default Alert;