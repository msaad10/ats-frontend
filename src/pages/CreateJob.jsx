import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import jobService from '../services/jobService';

const CreateJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!formData.title) errors.title = 'Job title is required';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.location) errors.location = 'Location is required';
    if (!formData.description) errors.description = 'Description is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      // Create the job
      await jobService.createJob(formData);
      
      // Redirect to dashboard
      navigate('/recruiter/dashboard');
      
      // Note: The dashboard will automatically fetch the updated job list
      // when it mounts or when the user navigates to it
    } catch (err) {
      setError('Failed to create job');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Create New Job</h2>
      
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Job Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            isInvalid={!!formErrors.title}
            placeholder="Enter job title"
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.title}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Department</Form.Label>
          <Form.Control
            type="text"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            isInvalid={!!formErrors.department}
            placeholder="Enter department"
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.department}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            isInvalid={!!formErrors.location}
            placeholder="Enter location"
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.location}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            isInvalid={!!formErrors.description}
            placeholder="Enter job description"
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.description}
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Job'}
        </Button>
      </Form>
    </Container>
  );
};

export default CreateJob; 