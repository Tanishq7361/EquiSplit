import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { validateRegister } from '../../utils/validators';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import styles from './auth.module.css';

const INITIAL = { name: '', email: '', password: '' };

export default function RegisterPage() {
  const { register, loading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useForm(INITIAL, validateRegister);

  const onSubmit = async (vals) => {
    clearError();
    const result = await register(vals);
    if (result.success) navigate('/login', { replace: true });
  };

  return (
    <div>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Get started</p>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Start splitting expenses with your groups.</p>
      </div>

      {error && <Alert variant="error" style={{ marginBottom: '1.25rem' }}>{error}</Alert>}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Full name"
          name="name"
          type="text"
          placeholder="Jane Smith"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.name && errors.name}
          autoComplete="name"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email && errors.email}
          autoComplete="email"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Min. 8 characters"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password && errors.password}
          hint="Use at least 8 characters"
          autoComplete="new-password"
        />
        <Button type="submit" fullWidth loading={loading} size="lg">
          Create account
        </Button>
      </form>

      <p className={styles.footer}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
