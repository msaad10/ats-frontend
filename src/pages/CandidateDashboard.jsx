import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveAs } from 'file-saver';
import jobService from '../services/jobService';
import candidateService from '../services/candidateService';

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsResponse, appliedJobsResponse, interviewsResponse] = await Promise.all([
          jobService.getAllJobs(),
          candidateService.getAppliedJobs(user.id),
          candidateService.getCandidateInterviews(user.id)
        ]);
        setJobs(jobsResponse);
        setAppliedJobs(appliedJobsResponse);
        setScheduledInterviews(interviewsResponse);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('resume', resumeFile);
      await candidateService.uploadResume(formData);
      setError(null);
      setResumeFile(null);
    } catch (err) {
      setError('Failed to upload resume');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleApplyJob = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleConfirmApply = async () => {
    try {
      await candidateService.applyForJob({
        jobId: selectedJob.id,
        userId: user.id
      });
      
      // Refresh applied jobs list
      const response = await candidateService.getAppliedJobs(user.id);
      setAppliedJobs(response.data);
      
      // Close modal and reset selected job
      setShowModal(false);
      setSelectedJob(null);
    } catch (err) {
      setError('Failed to apply for job');
      console.error(err);
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
  console.log("appliedJobs", appliedJobs);

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Candidate Dashboard</h2>
          {user && (
            <div className="mb-3">
              <p>Welcome, {user.firstName} {user.lastName}</p>
              <p>Email: {user.email}</p>
            </div>
          )}
          <Button variant="outline-danger" onClick={handleLogout}>
            Logout
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Resume Upload Section - Minimal with right-aligned buttons */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-end align-items-center gap-2">
                <Form.Control
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="d-none"
                  id="resume-upload"
                />
                <Button
                  variant="outline-primary"
                  onClick={() => document.getElementById('resume-upload').click()}
                  size="sm"
                >
                  Browse
                </Button>
                <Button
                  variant="primary"
                  onClick={handleResumeUpload}
                  disabled={!resumeFile || uploading}
                  size="sm"
                >
                  {uploading ? 'Uploading...' : 'Upload Resume'}
                </Button>
              </div>
              {resumeFile && (
                <div className="text-muted small mt-2">
                  Selected file: {resumeFile.name}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Available Jobs Section - Restored previous design */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h4>Available Jobs</h4>
            </Card.Header>
            <Card.Body>
              <div className="row">
                {jobs.map(job => (
                  <Col key={job.id} md={6} lg={4} className="mb-3">
                    <Card>
                      <Card.Body>
                        <Card.Title>{job.title}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                          {job.department} - {job.location}
                        </Card.Subtitle>
                        <Card.Text className="text-truncate">
                          {job.description}
                        </Card.Text>
                        <Button
                          variant="primary"
                          onClick={() => handleApplyJob(job)}
                          disabled={appliedJobs.some(applied => applied.jobId === job.id)}
                        >
                          {appliedJobs.some(applied => applied.jobId === job.id) ? 'Applied' : 'Apply'}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Scheduled Interviews Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h4>Scheduled Interviews</h4>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Interview Type</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Interviewer</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledInterviews.map((interview) => (
                    <tr key={interview.id}>
                      <td>{interview.job.title}</td>
                      <td>{interview.interviewType}</td>
                      <td>{new Date(interview.scheduledTime).toLocaleString()}</td>
                      <td>
                        <Badge bg={getStatusColor(interview.status)}>
                          {interview.status}
                        </Badge>
                      </td>
                      <td>{interview.interviewer.firstName} {interview.interviewer.lastName}</td>
                    </tr>
                  ))}
                  {scheduledInterviews.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No interviews scheduled yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Applied Jobs Section */}
      <Row>
        <Col>
          <h4 className="mb-3">Applied Jobs</h4>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Status</th>
                <th>Applied Date</th>
              </tr>
            </thead>
            <tbody>
              {appliedJobs.map((application) => (
                <tr key={application.id}>
                  <td>{application.jobTitle}</td>
                  <td>
                    <span className={`badge bg-${getStatusColor(application.currentStage)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td>{new Date(application.appliedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Application Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to apply for {selectedJob?.title}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmApply}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'ACCEPTED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    case 'SCHEDULED':
      return 'info';
    case 'COMPLETED':
      return 'primary';
    default:
      return 'secondary';
  }
};

export default CandidateDashboard; 