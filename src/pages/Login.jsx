import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/theme';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      // Redirect will be handled by AuthContext
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ 
      background: theme.colors.primary.gradient
    }}>
      <div className="bg-white rounded-4 shadow-lg overflow-hidden" style={{ maxWidth: '1000px', width: '90%' }}>
        <div className="row g-0">
          {/* Left Section */}
          <div className="col-12 col-md-6 p-5" style={{ 
            background: theme.colors.primary.leftPanel,
            color: theme.colors.text.light
          }}>
            <div className="d-flex align-items-center mb-4">
              <div className="d-flex align-items-center">
                <div className="bg-white rounded-circle p-2 me-2">
                  <div className="rounded-circle" style={{ 
                    width: '24px', 
                    height: '24px',
                    background: theme.colors.primary.gradientButton
                  }}></div>
                </div>
                <span className="h4 mb-0 text-white">HirePearls</span>
              </div>
            </div>
            <div className="welcome-content mt-5">
              <h1 className="display-5 fw-bold mb-4">Welcome</h1>
              <p className="lead mb-5">Sign in to continue access</p>
              <div className="mt-auto">
                <p className="small mb-0" style={{ color: theme.colors.text.light }}>Powered by 10Pearls</p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="col-12 col-md-6 p-5">
            <h2 className="fw-bold mb-4">Sign In</h2>

            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            <Form onSubmit={handleSubmit} className="w-100">
              <Form.Group className="mb-4">
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  style={{ paddingLeft: '10px', background: 'white', border:`1px solid rgb(106, 17, 203)` }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  style={{ paddingLeft: '10px', background: 'white', border:`1px solid rgb(106, 17, 203)` }}
                />
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Check
                  type="checkbox"
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ color: theme.colors.text.secondary }}
                />
                <Link to="/forgot-password" style={{ color: theme.colors.primary.main }}>
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-100 mb-3"
                style={{
                  background: theme.colors.primary.gradientButton,
                  border: 'none',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
                disabled={loading}
              >
                {loading ? (
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center">
                <p className="mb-0" style={{ color: theme.colors.text.secondary }}>
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: theme.colors.primary.main }}>
                    Register here
                  </Link>
                </p>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 