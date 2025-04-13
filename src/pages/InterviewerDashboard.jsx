import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Form, Alert, Spinner, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveAs } from 'file-saver';
import interviewService from '../services/interviewService';
import candidateService from '../services/candidateService';
import { FaDownload, FaCommentDots, FaEye, FaStar } from 'react-icons/fa';
import StyledTable from '../components/common/StyledTable';
import { theme } from '../styles/theme';
import StarRating from '../components/common/StarRating';
import RichTextEditor from '../components/common/RichTextEditor';

const InterviewerDashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    result: '',
    feedback: '',
    logicBuilding: '0',
    oop: '0',
    database: '0',
    communication: '0'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showFeedbackDetailsModal, setShowFeedbackDetailsModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

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
      feedback: '',
      logicBuilding: '0',
      oop: '0',
      database: '0',
      communication: '0'
    });
    setFormErrors({});
    setShowFeedbackModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({
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

  const handleFeedbackInputChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({
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
    try {
      setSubmitting(true);
      setError(null);

      const interviewScores = [];
      
      // Add scores based on interview type
      if (selectedInterview?.interviewType === 'INITIAL_SCREENING' || 
          selectedInterview?.interviewType === 'ARCHITECT' || 
          selectedInterview?.interviewType === 'DIRECTOR') {
        interviewScores.push(
          { criteria: 'logicBuilding', score: parseInt(feedbackForm.logicBuilding) },
          { criteria: 'oop', score: parseInt(feedbackForm.oop) },
          { criteria: 'db', score: parseInt(feedbackForm.database) }
        );
      }

      // Add communication score for DIRECTOR interviews
      if (selectedInterview?.interviewType === 'DIRECTOR') {
        interviewScores.push({ criteria: 'communication', score: parseInt(feedbackForm.communication) });
      }

      const submitData = {
        result: feedbackForm.result,
        feedback: feedbackForm.feedback,
        scores: interviewScores
      };

      await interviewService.updateInterviewStatus(selectedInterview.id, submitData);
      
      // Refresh interviews list
      const response = await interviewService.getInterviewerInterviews(selectedInterview.interviewerId);
      setInterviews(response);
      
      setShowFeedbackModal(false);
      setSelectedInterview(null);
      setFeedbackForm({
        result: '',
        feedback: '',
        logicBuilding: '0',
        oop: '0',
        database: '0',
        communication: '0'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleViewFeedbackDetails = (interview) => {
    setSelectedFeedback(interview);
    setShowFeedbackDetailsModal(true);
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
                      background: interview.result === 'PASSED' ? 'linear-gradient(to right, #28a745, #20c997)' :
                                interview.result === 'FAILED' ? 'linear-gradient(to right, #dc3545, #c82333)' :
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
                      {!interview.interviewScores ? (
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
                      ) : (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>View Feedback</Tooltip>}
                        >
                          <Button
                            className="btn-gradient"
                            size="sm"
                            onClick={() => handleViewFeedbackDetails(interview)}
                            style={{
                              border: 'none',
                              padding: '0.5rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <FaEye />
                          </Button>
                        </OverlayTrigger>
                      )}
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
          <Form onSubmit={handleFeedbackSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Result</Form.Label>
              <Form.Select
                value={feedbackForm.result}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, result: e.target.value })}
                required
              >
                <option value="">Select Result</option>
                <option value="PASSED">Pass</option>
                <option value="FAILED">Fail</option>
              </Form.Select>
            </Form.Group>

            {(selectedInterview?.interviewType === 'INITIAL_SCREENING' || 
              selectedInterview?.interviewType === 'ARCHITECT' || 
              selectedInterview?.interviewType === 'DIRECTOR') && (
              <>
                <StarRating
                  label="Programming and Logic Building"
                  value={feedbackForm.logicBuilding}
                  onChange={(value) => setFeedbackForm({ ...feedbackForm, logicBuilding: value })}
                  required
                />
                <StarRating
                  label="Object Oriented Programming"
                  value={feedbackForm.oop}
                  onChange={(value) => setFeedbackForm({ ...feedbackForm, oop: value })}
                  required
                />
                <StarRating
                  label="Database"
                  value={feedbackForm.database}
                  onChange={(value) => setFeedbackForm({ ...feedbackForm, database: value })}
                  required
                />
              </>
            )}

            {selectedInterview?.interviewType === 'DIRECTOR' && (
              <StarRating
                label="Communication and Behavioral"
                value={feedbackForm.communication}
                onChange={(value) => setFeedbackForm({ ...feedbackForm, communication: value })}
                required
              />
            )}

            <Form.Group className="mb-3">
              <Form.Label>Feedback</Form.Label>
              <RichTextEditor
                value={feedbackForm.feedback}
                onChange={(value) => setFeedbackForm({ ...feedbackForm, feedback: value })}
                placeholder="Enter your feedback here..."
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
                fontWeight: 500
              }}
              disabled={loading}
            >
              {loading ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Feedback Details Modal */}
      <Modal show={showFeedbackDetailsModal} onHide={() => setShowFeedbackDetailsModal(false)}>
        <Modal.Header closeButton style={{ background: `rgb(106, 17, 203)`, borderBottom: '1px solid #e5e7eb' }}>
          <Modal.Title style={{ color: theme.colors.text.primary, fontSize: '1.25rem', fontWeight: 500 }}>
            Interview Feedback Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'white' }}>
          {selectedFeedback && (
            <div>
              <div className="mb-4">
                <h6 className="text-muted mb-2">Interview Type</h6>
                <p className="mb-0">{selectedFeedback.interviewType}</p>
              </div>

              <div className="mb-4">
                <h6 className="text-muted mb-2">Result</h6>
                <Badge style={{ 
                  background: selectedFeedback.result === 'PASSED' ? 'linear-gradient(to right, #28a745, #20c997)' :
                            'linear-gradient(to right, #dc3545, #c82333)'
                }}>
                  {selectedFeedback.result}
                </Badge>
              </div>

              {selectedFeedback.interviewScores && selectedFeedback.interviewScores.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-muted mb-3">Interview Scores</h6>
                  <div className="d-flex flex-column gap-3">
                    {selectedFeedback.interviewScores.map((score, index) => (
                      <div key={index}>
                        <label className="text-muted mb-1">
                          {score.criteria.charAt(0).toUpperCase() + score.criteria.slice(1).replace(/([A-Z])/g, ' $1')}
                        </label>
                        <div className="d-flex align-items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              size={20}
                              color={star <= score.score ? `rgb(106, 17, 203)` : '#e4e5e9'}
                            />
                          ))}
                          <span className="ms-2 text-muted">{score.score} / 5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h6 className="text-muted mb-2">Feedback</h6>
                <div 
                  className="p-3 rounded" 
                  style={{ 
                    background: theme.colors.background,
                    border: '1px solid #e5e7eb',
                    minHeight: '100px'
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedFeedback.feedback }}
                />
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default InterviewerDashboard; 