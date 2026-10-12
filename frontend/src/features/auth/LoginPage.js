import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { validateLogin } from '../../utils/validators';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';
import styles from './auth.module.css';

const INITIAL = { email: '', password: '' };

export default function LoginPage() {
  const { login, loginWithGoogle, loading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useForm(INITIAL, validateLogin);

  const onSubmit = async (vals) => {
    clearError();
    const result = await login(vals);
    if (result.success) navigate(from, { replace: true });
  };

  const onGoogleSuccess = async (credential) => {
    clearError();
    const result = await loginWithGoogle(credential);
    if (result.success) navigate(from, { replace: true });
  };

  return (
    <div>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Welcome back</p>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>Enter your credentials to continue.</p>
      </div>

      {error && <Alert variant="error" style={{ marginBottom: '1.25rem' }}>{error}</Alert>}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
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
          placeholder="••••••••"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password && errors.password}
          autoComplete="current-password"
        />
        <Button type="submit" fullWidth loading={loading} loadingText="Signing in..." size="lg">
          Sign in
        </Button>

        <div className={styles.divider}>or</div>

        <GoogleLoginButton
          onSuccess={onGoogleSuccess}
          onError={(msg) => console.error(msg)}
          text="Continue with Google"
          disabled={loading}
        />
      </form>

      <p className={styles.footer}>
        Don't have an account? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}
