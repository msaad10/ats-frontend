import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Form, Alert, Spinner, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveAs } from 'file-saver';
import interviewService from '../services/interviewService';
import candidateService from '../services/candidateService';
import { FaDownload, FaCommentDots } from 'react-icons/fa';
import StyledTable from '../components/common/StyledTable';
import { theme } from '../styles/theme';

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

      <Card>
        <Card.Header className="bg-white">
          <h5 className="mb-1" style={{ color: theme.colors.text.primary }}>My Interviews</h5>
        </Card.Header>
        <Card.Body>
          <StyledTable>
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Job Title</th>
                <th>Interview Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((interview) => (
                <tr key={interview.id}>
                  <td style={{ color: theme.colors.text.primary }}>{interview.candidateName}</td>
                  <td style={{ color: theme.colors.text.secondary }}>{interview.jobTitle}</td>
                  <td style={{ color: theme.colors.text.secondary }}>
                    {new Date(interview.dateTime).toLocaleString()}
                  </td>
                  <td>
                    <Badge style={{ 
                      background: interview.result === 'PASS' ? 'linear-gradient(to right, #28a745, #20c997)' :
                                interview.result === 'FAIL' ? 'linear-gradient(to right, #dc3545, #c82333)' :
                                theme.colors.primary.gradientButton
                    }}>
                      {interview.result || 'PENDING'}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Download Resume</Tooltip>}
                      >
                        <Button
                          className="btn-gradient"
                          size="sm"
                          onClick={() => handleDownloadResume(interview.candidateId)}
                          style={{
                            border: 'none',
                            padding: '0.5rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FaDownload />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Give Feedback</Tooltip>}
                      >
                        <Button
                          className="btn-gradient"
                          size="sm"
                          onClick={() => handleGiveFeedback(interview)}
                          style={{
                            border: 'none',
                            padding: '0.5rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FaCommentDots />
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </Card.Body>
      </Card>

      {/* Feedback Modal */}
      <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)}>
        <Modal.Header closeButton style={{ background: `rgb(106, 17, 203)`, borderBottom: '1px solid #e5e7eb' }}>
          <Modal.Title style={{ color: theme.colors.text.primary, fontSize: '1.25rem', fontWeight: 500 }}>
            Provide Interview Feedback
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'white' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: theme.colors.text.primary, fontWeight: 500 }}>
                Interview Result
              </Form.Label>
              <Form.Select
                name="result"
                value={feedbackForm.result}
                onChange={handleInputChange}
                isInvalid={!!formErrors.result}
                style={{ 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.5rem'
                }}
              >
                <option value="">Select result...</option>
                <option value="PASS">Pass</option>
                <option value="FAIL">Fail</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.result}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: theme.colors.text.primary, fontWeight: 500 }}>
                Feedback
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="feedback"
                value={feedbackForm.feedback}
                onChange={handleInputChange}
                isInvalid={!!formErrors.feedback}
                placeholder="Provide detailed feedback about the interview..."
                style={{ 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.5rem'
                }}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.feedback}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: 'white', borderTop: '1px solid #e5e7eb' }}>
          <Button 
            onClick={() => setShowFeedbackModal(false)}
            style={{ 
              background: 'white',
              border: '1px solid #e5e7eb',
              color: theme.colors.text.primary,
              boxShadow: 'none'
            }}
          >
            Cancel
          </Button>
          <Button 
            className="btn-gradient"
            onClick={handleFeedbackSubmit}
            disabled={submitting}
            style={{
              border: 'none',
              padding: '0.5rem 1rem',
              fontWeight: 500
            }}
          >
            {submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="ms-2">Submitting...</span>
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InterviewerDashboard; 