// src/components/common/FormInput.jsx
// Controlled input with label + error display.

import React from 'react';

function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required,
  options,       
  disabled,
  min,
  max,
}) {
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${error ? '#e53935' : '#bdbdbd'}`,
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    background: disabled ? '#f5f5f5' : '#fff',
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </label>
      )}

      {options ? (
        <select name={name} value={value} onChange={onChange} style={inputStyle} disabled={disabled}>
          <option value="">-- Select --</option>
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          style={inputStyle}
        />
      )}

      {error && (
        <p style={{ color: '#e53935', fontSize: '12px', marginTop: '4px' }}>{error}</p>
      )}
    </div>
  );
}

export default FormInput;