import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { saveAs } from 'file-saver';
import jobService from '../services/jobService';
import candidateService from '../services/candidateService';
import interviewService from '../services/interviewService';
import { FaDownload, FaCalendarAlt, FaEye } from 'react-icons/fa';
import StyledTable from '../components/common/StyledTable';
import { theme } from '../styles/theme';

const RecruiterJobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    interviewerId: '',
    interviewType: '',
    dateTime: '',
    details: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [scheduling, setScheduling] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [candidateInterviews, setCandidateInterviews] = useState([]);

  console.log(selectedCandidate, "selectedCandidate");
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobResponse, candidatesResponse, interviewersResponse] = await Promise.all([
          jobService.getJobById(jobId),
          candidateService.getJobCandidates(jobId),
          candidateService.getInterviewers()
        ]);
        setJob(jobResponse);
        setCandidates(candidatesResponse);
        setInterviewers(interviewersResponse);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const handleDownloadResume = async (userId) => {
    try {
      const response = await candidateService.getResume(userId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(blob, `resume-${userId}.pdf`);
    } catch (err) {
      setError('Failed to download resume');
      console.error(err);
    }
  };

  const handleScheduleInterview = (candidate) => {
    setSelectedCandidate(candidate);
    setShowInterviewModal(true);
  };

  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    // Validate form
    const errors = {};
    if (!interviewForm.interviewerId) errors.interviewerId = 'Interviewer is required';
    if (!interviewForm.interviewType) errors.interviewType = 'Interview type is required';
    if (!interviewForm.dateTime) errors.dateTime = 'Date and time is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setScheduling(true);
      // Format the date and time to match Java's LocalDateTime format (yyyy-MM-ddTHH:mm)
      const date = new Date(interviewForm.dateTime);
      const formattedDateTime = date.toISOString().slice(0, 16); // This gives format: yyyy-MM-ddTHH:mm
      
      await candidateService.scheduleInterview({
        interviewerId: interviewForm.interviewerId,
        candidateId: selectedCandidate.id,
        jobId: jobId,
        interviewType: interviewForm.interviewType,
        scheduledTime: formattedDateTime,
        details: interviewForm.details
      });
      
      // Wait for the job candidates API to complete and update the list
      const response = await candidateService.getJobCandidates(jobId);
      if (response && response.data) {
        setCandidates(response.data);
      }
      
      // Reset form and close modal
      setShowInterviewModal(false);
      setSelectedCandidate(null);
      setInterviewForm({
        interviewerId: '',
        interviewType: '',
        dateTime: '',
        details: ''
      });
      setFormErrors({});
    } catch (err) {
      setError('Failed to schedule interview');
      console.error(err);
    } finally {
      setScheduling(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInterviewForm(prev => ({
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

  const getStatusBadge = (status) => {
    return (
      <Badge style={{ 
        background: status === 'PENDING' ? 'linear-gradient(to right, #0088cc, #00a3cc)' :
                  status === 'ACCEPTED' ? 'linear-gradient(to right, #28a745, #20c997)' :
                  status === 'REJECTED' ? 'linear-gradient(to right, #dc3545, #c82333)' :
                  theme.colors.primary.gradientButton
      }}>
        {status}
      </Badge>
    );
  };

  const handleViewFeedback = async (candidate) => {
    try {
      setLoadingFeedback(true);
      setFeedbackError('');
      const response = await candidateService.getCandidateInterviews(candidate.userId);
      setCandidateInterviews(response);
      setSelectedCandidate(candidate);
      setShowFeedbackModal(true);
    } catch (err) {
      setFeedbackError('Failed to fetch interview details');
      console.error(err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      </Container>
    );
  }

  const getStageBadge = (stage) => {
    return (
      <Badge style={{ 
        background: stage === 'PASSED' ? 'linear-gradient(to right, #28a745, #20c997)' :
                  stage === 'PENDING' ? theme.colors.primary.gradientButton :
                  stage === 'FAILED' ? 'linear-gradient(to right, #dc3545, #c82333)' :
                  'linear-gradient(to right, #6c757d, #495057)'
      }}>
        {stage}
      </Badge>
    );
  };

  return (
    <Container fluid className="py-4">
      {/* Job Details Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">{job?.title}</h4>
                <Button 
                  className="btn-gradient"
                  onClick={() => navigate('/recruiter/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Department:</strong> {job?.department}</p>
                  <p><strong>Location:</strong> {job?.location}</p>
                  <p><strong>Status:</strong> {getStatusBadge(job?.status)}</p>
                </Col>
                <Col md={6}>
                  <p style={{ color: theme.colors.text.primary, fontWeight: 500, marginBottom: '0.5rem' }}>
                    <strong>Description:</strong>
                  </p>
                  <div 
                    className="rounded p-3" 
                    style={{ 
                      background: 'linear-gradient(145deg, rgba(106, 17, 203, 0.05), rgba(37, 117, 252, 0.05))',
                      border: '1px solid rgba(106, 17, 203, 0.1)',
                      color: theme.colors.text.secondary,
                      fontSize: '0.95rem',
                      lineHeight: '1.6'
                    }}
                  >
                    {job?.description}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Candidates Section */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0" style={{ color: theme.colors.text.primary }}>Applied Candidates</h5>
            </Card.Header>
            <Card.Body>
              <StyledTable>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td style={{ color: theme.colors.text.primary }}>{candidate.userName}</td>
                      <td style={{ color: theme.colors.text.secondary }}>{candidate.email}</td>
                      <td style={{ color: theme.colors.text.secondary }}>
                        {new Date(candidate.appliedAt	).toLocaleDateString()}
                      </td>
                      <td>
                        {getStatusBadge(candidate.currentStage)}
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
                              onClick={() => handleDownloadResume(candidate.userId)}
                            >
                              <FaDownload />
                            </Button>
                          </OverlayTrigger>

                          {!candidate.interview && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Schedule Interview</Tooltip>}
                            >
                              <Button
                                className="btn-gradient"
                                size="sm"
                                onClick={() => handleScheduleInterview(candidate)}
                              >
                                <FaCalendarAlt />
                              </Button>
                            </OverlayTrigger>
                          )}

                          {candidate.interview && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>View Interviews</Tooltip>}
                            >
                              <Button
                                className="btn-gradient"
                                size="sm"
                                onClick={() => handleViewFeedback(candidate)}
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
        </Col>
      </Row>

      {/* Interview Scheduling Modal */}
      <Modal show={showInterviewModal} onHide={() => setShowInterviewModal(false)}>
        <Modal.Header closeButton style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
          <Modal.Title style={{ color: theme.colors.text.primary, fontSize: '1.25rem', fontWeight: 500 }}>
            Schedule Interview for {selectedCandidate?.userName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleInterviewSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Interviewer</Form.Label>
              <Form.Select
                name="interviewerId"
                value={interviewForm.interviewerId}
                onChange={handleInputChange}
                required
                style={{ 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.5rem'
                }}
              >
                <option value="">Select Interviewer</option>
                {interviewers.map(interviewer => (
                  <option key={interviewer.id} value={interviewer.id}>
                    {interviewer.userName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Interview Type</Form.Label>
              <Form.Select
                name="interviewType"
                value={interviewForm.interviewType}
                onChange={handleInputChange}
                required
                style={{ 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.5rem'
                }}
              >
                <option value="">Select Type</option>
                <option value="TECHNICAL">Technical</option>
                <option value="BEHAVIORAL">Behavioral</option>
                <option value="HR">HR</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date and Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="dateTime"
                value={interviewForm.dateTime}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().slice(0, 16)}
                style={{ 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.5rem'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Additional Details</Form.Label>
              <Form.Control
                as="textarea"
                name="details"
                value={interviewForm.details}
                onChange={handleInputChange}
                rows={3}
                style={{ 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.5rem'
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
                fontWeight: 500
              }}
              disabled={scheduling}
            >
              {scheduling ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                'Schedule Interview'
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Feedback Modal */}
      <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)} size="lg">
        <Modal.Header closeButton style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
          <Modal.Title style={{ color: theme.colors.text.primary, fontSize: '1.25rem', fontWeight: 500 }}>
            Interview Feedback for {selectedCandidate?.userName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'white', maxHeight: '70vh', overflowY: 'auto' }}>
          {loadingFeedback ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : feedbackError ? (
            <Alert variant="danger">{feedbackError}</Alert>
          ) : candidateInterviews.length === 0 ? (
            <Alert variant="info">No interviews scheduled yet.</Alert>
          ) : (
            <StyledTable>
              <thead>
                <tr>
                  <th>Interview Type</th>
                  <th>Date & Time</th>
                  <th>Interviewer</th>
                  <th>Result</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {candidateInterviews.map((interview) => (
                  <tr key={interview.id}>
                    <td style={{ color: theme.colors.text.primary }}>{interview.interviewType}</td>
                    <td style={{ color: theme.colors.text.secondary }}>
                      {new Date(interview.dateTime).toLocaleString()}
                    </td>
                    <td style={{ color: theme.colors.text.secondary }}>
                      {interview.interviewer?.name || interview.interviewerName || '-'}
                    </td>
                    <td>
                      {getStageBadge(interview.result)}
                    </td>
                    <td className="text-break" style={{ maxWidth: '300px', color: theme.colors.text.secondary }}>
                      {interview.feedback || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          )}
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
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RecruiterJobDetail; 