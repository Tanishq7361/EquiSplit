import { useState, useCallback } from 'react';

/**
 * Reusable form hook with validation support.
 * @param {Object} initialValues
 * @param {Function} validate
 */
export function useForm(initialValues, validate) {

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

  }, [errors]);

  const handleBlur = useCallback((e) => {

    const { name } = e.target;

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    if (validate) {

      const result = validate(values);

      setErrors(prev => ({
        ...prev,
        [name]: result[name] || ''
      }));
    }

  }, [validate, values]);

  const handleSubmit = useCallback((onSubmit) => (e) => {

    e.preventDefault();

    if (validate) {

      const result = validate(values);

      setErrors(result);

      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({
          ...acc,
          [key]: true
        }),
        {}
      );

      setTouched(allTouched);

      if (Object.values(result).some(Boolean)) {
        return;
      }
    }

    onSubmit(values);

  }, [validate, values]);

  const reset = useCallback(() => {

    setValues(initialValues);
    setErrors({});
    setTouched({});

  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {

    setValues(prev => ({
      ...prev,
      [name]: value
    }));

  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setValues
  };
}