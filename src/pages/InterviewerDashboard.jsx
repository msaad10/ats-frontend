import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Spinner, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveAs } from 'file-saver';
import interviewService from '../services/interviewService';
import candidateService from '../services/candidateService';
import { FaDownload, FaCommentDots } from 'react-icons/fa';

const InterviewerDashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    result: '',
    feedback: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'INTERVIEWER') {
      navigate('/login');
      return;
    }

    fetchInterviews();
  }, [user, navigate]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await interviewService.getInterviewerInterviews(user.id);
      if (response) {
        setInterviews(response);
      }
    } catch (err) {
      setError('Failed to fetch interviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = async (candidateId) => {
    try {
      const response = await candidateService.getResume(candidateId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-${candidateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download resume');
      console.error(err);
    }
  };

  const handleGiveFeedback = (interview) => {
    setSelectedInterview(interview);
    setFeedbackForm({
      result: '',
      feedback: ''
    });
    setFormErrors({});
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!feedbackForm.result) errors.result = 'Result is required';
    if (!feedbackForm.feedback) errors.feedback = 'Feedback is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await interviewService.updateInterviewStatus(selectedInterview.id, {
        result: feedbackForm.result,
        feedback: feedbackForm.feedback
      });
      
      // Close modal and refresh interviews
      setShowFeedbackModal(false);
      fetchInterviews();
    } catch (err) {
      setError('Failed to submit feedback');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  const getStageBadge = (stage) => {
    const variants = {
      FAILED: 'danger',
      PENDING: 'info',
      PASSED: 'success',
    };
    return <Badge bg={variants[stage]}>{stage}</Badge>;
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Interviewer Dashboard</h2>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Interview Type</th>
            <th>Date & Time</th>
            <th>Candidate</th>
            <th>Result</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {interviews.map(interview => (
            <tr key={interview.id}>
              <td>{interview.jobTitle}</td>
              <td>{interview.interviewType}</td>
              <td>{new Date(interview.dateTime).toLocaleString()}</td>
              <td>{interview.candidateName}</td>
              <td>{getStageBadge(interview.result)}</td>
              <td>
                <div className="d-flex gap-2">
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Download Resume</Tooltip>}
                  >
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleDownloadResume(interview.candidateId)}
                    >
                      <FaDownload />
                    </Button>
                  </OverlayTrigger>

                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>View Feedback</Tooltip>}
                  >
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleGiveFeedback(interview)}
                    >
                      <FaCommentDots />
                    </Button>
                  </OverlayTrigger>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Feedback Modal */}
      <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Give Interview Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFeedbackSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Result</Form.Label>
              <Form.Select
                value={feedbackForm.result}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, result: e.target.value })}
                isInvalid={!!formErrors.result}
              >
                <option value="">Select Result</option>
                <option value="PASSED">Pass</option>
                <option value="FAILED">Fail</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.result}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={feedbackForm.feedback}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                isInvalid={!!formErrors.feedback}
                placeholder="Enter your feedback"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.feedback}
              </Form.Control.Feedback>
            </Form.Group>

            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default InterviewerDashboard; 