import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/theme';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
                <span className="h4 mb-0 text-white">ATS</span>
              </div>
            </div>
            <div className="welcome-content mt-5">
              <h1 className="display-5 fw-bold mb-4">Welcome</h1>
              <p className="lead mb-5">Sign in to continue access</p>
              <div className="mt-auto">
                <p className="small mb-0 text-white-50">www.ats.com</p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="col-12 col-md-6 p-5">
            <h2 className="fw-bold mb-4">Sign In</h2>

            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="border-0 border-bottom rounded-0"
                  style={{ paddingLeft: '5px' }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="border-0 border-bottom rounded-0"
                  style={{ paddingLeft: '5px' }}
                />
              </Form.Group>

              <Button
                type="submit"
                className="w-100 mb-4 py-2"
                style={{ 
                  background: theme.colors.primary.gradientButton,
                  border: 'none'
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Signing in...
                  </>
                ) : (
                  'CONTINUE'
                )}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 