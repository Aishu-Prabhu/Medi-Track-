import React from 'react';
import { useNavigate } from 'react-router-dom';

function BackButton({ to, label = '← Back to Dashboard' }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      style={styles.btn}
    >
      {label}
    </button>
  );
}

const styles = {
  btn: {
    background: '#1565C0',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    marginBottom: '18px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
  },
};

export default BackButton;