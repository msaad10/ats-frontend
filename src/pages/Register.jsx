import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/theme';
import { FaUserTie, FaUserGraduate } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'RECRUITER',
    skills: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    // Name validation
    if (formData.firstName.length < 2) {
      setError('First name must be at least 2 characters long');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
    } catch (err) {
      console.log(err, "err");
      setError(err.response?.data?.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p className="text-muted">Choose your role to get started</p>
        </div>

        <div className="auth-body">
          <div className="role-selection">
            <Button
              className={`role-button ${formData.role === 'RECRUITER' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'RECRUITER' })}
              style={{
                background: formData.role === 'RECRUITER' ? theme.colors.primary.gradientButton : 'white',
                border: '1px solid #e5e7eb',
                color: formData.role === 'RECRUITER' ? 'white' : theme.colors.text.primary,
                padding: '1rem',
                width: '100%',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <FaUserTie size={20} />
              <span>I'm a Recruiter</span>
            </Button>

            <Button
              className={`role-button ${formData.role === 'INTERVIEWER' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'INTERVIEWER' })}
              style={{
                background: formData.role === 'INTERVIEWER' ? theme.colors.primary.gradientButton : 'white',
                border: '1px solid #e5e7eb',
                color: formData.role === 'INTERVIEWER' ? 'white' : theme.colors.text.primary,
                padding: '1rem',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <FaUserGraduate size={20} />
              <span>I'm an Interviewer</span>
            </Button>
          </div>

          <Form onSubmit={handleSubmit} className="mt-4">
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    required
                    style={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      color: theme.colors.text.primary,
                      padding: '0.75rem'
                    }}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    required
                    style={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      color: theme.colors.text.primary,
                      padding: '0.75rem'
                    }}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  color: theme.colors.text.primary,
                  padding: '0.75rem'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  color: theme.colors.text.primary,
                  padding: '0.75rem'
                }}
              />
              <Form.Text className="text-muted">
                Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  color: theme.colors.text.primary,
                  padding: '0.75rem'
                }}
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100"
              style={{
                background: theme.colors.primary.gradientButton,
                border: 'none',
                padding: '0.75rem',
                fontSize: '1rem',
                fontWeight: 500,
                marginTop: '1rem'
              }}
              disabled={loading}
            >
              {loading ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                'Create Account'
              )}
            </Button>
          </Form>

          <div className="auth-footer mt-4">
            <p className="text-center text-muted mb-0">
              Already have an account?{' '}
              <Link to="/login" style={{ color: theme.colors.primary.main }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 