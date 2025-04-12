import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { saveAs } from 'file-saver';
import jobService from '../services/jobService';
import candidateService from '../services/candidateService';
import interviewService from '../services/interviewService';
import { FaDownload, FaCalendarAlt, FaEye } from 'react-icons/fa';

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
    const variants = {
      PENDING: 'warning',
      ACCEPTED: 'success',
      REJECTED: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
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
    console.log(stage, "stage");
    const variants = {
      PASSED: 'primary',
      PENDING: 'info',
      FAILED: 'danger',
    };
    return <Badge bg={variants[stage]}>{stage}</Badge>;
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
                <Button variant="outline-primary" onClick={() => navigate('/recruiter/dashboard')}>
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
                  <p><strong>Description:</strong></p>
                  <div className="border rounded p-3 bg-light">
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
            <Card.Header>
              <h4 className="mb-0">Applied Candidates</h4>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates?.map((candidate) => (
                    <tr key={candidate.id}>
                      <td>{candidate.userName}</td>
                      <td>{candidate.email}</td>
                      <td>{getStatusBadge(candidate.currentStage)}</td>
                      <td>{new Date(candidate.appliedAt).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Download Resume</Tooltip>}
                          >
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleDownloadResume(candidate.userId)}
                            >
                              <FaDownload />
                            </Button>
                          </OverlayTrigger>

                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Schedule Interview</Tooltip>}
                            >
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleScheduleInterview(candidate)}
                              >
                                <FaCalendarAlt />
                              </Button>
                            </OverlayTrigger>

                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>View Interviews</Tooltip>}
                            >
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => handleViewFeedback(candidate)}
                              >
                                <FaEye />
                              </Button>
                            </OverlayTrigger>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {candidates?.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No candidates have applied for this job yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Schedule Interview Modal */}
      <Modal show={showInterviewModal} onHide={() => setShowInterviewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Schedule Interview</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleInterviewSubmit}>
          <Modal.Body>
            {selectedCandidate && (
              <div className="mb-3">
                <p><strong>Candidate:</strong> {selectedCandidate.userName}</p>
                <p><strong>Job:</strong> {job?.title}</p>
              </div>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Interviewer</Form.Label>
              <Form.Select
                name="interviewerId"
                value={interviewForm.interviewerId}
                onChange={handleInputChange}
                isInvalid={!!formErrors.interviewerId}
              >
                <option value="">Select Interviewer</option>
                {interviewers.map(interviewer => (
                  <option key={interviewer.id} value={interviewer.id}>
                    {interviewer.username}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.interviewerId}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Interview Type</Form.Label>
              <Form.Select
                name="interviewType"
                value={interviewForm.interviewType}
                onChange={handleInputChange}
                isInvalid={!!formErrors.interviewType}
              >
                <option value="">Select Type</option>
                <option value="TECHNICAL">Technical</option>
                <option value="BEHAVIORAL">Behavioral</option>
                <option value="SYSTEM_DESIGN">System Design</option>
                <option value="CODING">Coding</option>
                <option value="HR">HR</option>
                <option value="MANAGERIAL">Managerial</option>
                <option value="CULTURE_FIT">Culture Fit</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.interviewType}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date and Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="dateTime"
                value={interviewForm.dateTime}
                onChange={handleInputChange}
                isInvalid={!!formErrors.dateTime}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.dateTime}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Additional Details</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="details"
                value={interviewForm.details}
                onChange={handleInputChange}
                placeholder="Enter any additional details about the interview..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInterviewModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={scheduling}>
              {scheduling ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Feedback Modal */}
      <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Interview Feedback for {selectedCandidate?.userName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
            <Table striped hover responsive>
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
                    <td>{interview.interviewType}</td>
                    <td>{new Date(interview.dateTime).toLocaleString()}</td>
                    <td>{interview.interviewerName || '-'}</td>
                    <td>{getStageBadge(interview.result)}</td>
                    <td className="text-break" style={{ maxWidth: '300px' }}>
                      {interview.feedback || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RecruiterJobDetail; 