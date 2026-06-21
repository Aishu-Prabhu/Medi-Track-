// src/hooks/useForm.js
// Reusable controlled-form hook.
// Usage:
//   const { values, errors, handleChange, validate, reset } = useForm(initial, rules);

import { useState } from 'react';

export function useForm(initialValues, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    Object.entries(validationRules).forEach(([field, rule]) => {
      const error = rule(values[field], values);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  const setFieldValue = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return { values, errors, handleChange, validate, reset, setFieldValue, setValues };
}