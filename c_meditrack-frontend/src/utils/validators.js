// src/utils/validators.js
// Reusable validation rule factories for useForm.

export const required = (label) => (val) =>
  !val || !String(val).trim() ? `${label} is required` : '';

export const email = (val) => {
  if (!val) return 'Email is required';
  return /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(val)
    ? ''
    : 'Enter a valid email (e.g. user@gmail.com)';
};

export const minLength = (label, min) => (val) =>
  !val || val.length < min ? `${label} must be at least ${min} characters` : '';

export const passwordStrength = (val) => {
  if (!val) return 'Password is required';
  if (val.length < 6) return 'Password must be at least 6 characters';
  if (!/(?=.*[A-Za-z])(?=.*\d)/.test(val))
    return 'Password must contain at least one letter and one number';
  return '';
};

export const phone = (val) => {
  if (!val) return 'Phone is required';
  return /^[0-9]{10}$/.test(val) ? '' : 'Phone must be exactly 10 digits';
};

export const bloodGroup = (val) => {
  if (!val) return 'Blood group is required';
  return /^(A\+|A-|B\+|B-|O\+|O-|AB\+|AB-)$/.test(val)
    ? ''
    : 'Blood group must be A+, A-, B+, B-, O+, O-, AB+ or AB-';
};

export const positiveNumber = (label) => (val) => {
  if (val === '' || val === null || val === undefined) return `${label} is required`;
  return Number(val) > 0 ? '' : `${label} must be greater than 0`;
};