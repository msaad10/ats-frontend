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
  const [recentJobs, setRecentJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsResponse, appliedJobsResponse, interviewsResponse, recentJobsResponse] = await Promise.all([
          jobService.getAllJobs(),
          candidateService.getAppliedJobs(user.id),
          candidateService.getCandidateInterviews(user.id),
          jobService.getRecentJobs()
        ]);
        setJobs(jobsResponse);
        setRecentJobs(recentJobsResponse);
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
      setUploadError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      // Create FormData and append the file
      const formData = new FormData();
      formData.append('file', resumeFile);

      // Send the request with FormData
      await candidateService.uploadResume(formData);
      
      setShowResumeModal(false);
      setResumeFile(null);
      setSuccess('Resume uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.log("err", err);
      setUploadError(err.response?.data?.message || 'Failed to upload resume');
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
      setLoading(true);
      setError(null);
      setShowModal(false);

      // Apply for the job
      await candidateService.applyForJob({
        jobId: selectedJob.id,
        userId: user.id
      });
      
      // Refresh both jobs and applied jobs lists
      const [jobsResponse, appliedJobsResponse] = await Promise.all([
        jobService.getAllJobs(),
        candidateService.getAppliedJobs(user.id)
      ]);

      setJobs(jobsResponse);
      setAppliedJobs(appliedJobsResponse);
      
      // Close modal and reset selected job
      setShowModal(false);
      setSelectedJob(null);
    } catch (err) {
      setError('Failed to apply for job');
      console.error(err);
    } finally {
      setLoading(false);
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
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Resume Upload Section - Minimal with right-aligned buttons */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Resume</h4>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowResumeModal(true)}
              >
                Upload Resume
              </Button>
            </Card.Header>
            <Card.Body>
              {appliedJobs?.length > 0 ? (
                <p>Your resume has been uploaded and is being used for job applications.</p>
              ) : (
                <p>Upload your resume to start applying for jobs.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Available Jobs Section - Restored previous design */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Recent Jobs</h4>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => navigate('/jobs')}
              >
                View All Jobs
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="row">
                {recentJobs.map(job => (
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
                          disabled={appliedJobs?.some(applied => applied.jobId === job.id)}
                        >
                          {appliedJobs?.some(applied => applied.jobId === job.id) ? 'Applied' : 'Apply'}
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
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledInterviews.map((interview) => (
                    <tr key={interview.id}>
                      <td>{interview.jobTitle}</td>
                      <td>{interview.interviewType}</td>
                      <td>{new Date(interview.dateTime).toLocaleString()}</td>
                      <td>
                        <Badge bg={getStatusColor(interview.result)}>
                          {interview.result}
                        </Badge>
                      </td>
                      <td>{interview.interviewerName}</td>
                      <td>{interview.details}</td>
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
              {appliedJobs?.map((application) => (
                <tr key={application.id}>
                  <td>{application.jobTitle}</td>
                  <td>
                    <span className={`badge bg-${getStatusColor(application.currentStage)}`}>
                      {application.currentStage}
                    </span>
                  </td>
                  <td>{new Date(application.appliedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Resume Upload Modal */}
      <Modal show={showResumeModal} onHide={() => setShowResumeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Resume</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="resumeFile" className="mb-3">
              <Form.Label>Select Resume (PDF or DOC)</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
              />
              <Form.Text className="text-muted">
                Supported formats: PDF
              </Form.Text>
            </Form.Group>
            {uploadError && <Alert variant="danger">{uploadError}</Alert>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResumeModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleResumeUpload}
            disabled={uploading || !resumeFile}
          >
            {uploading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="ms-2">Uploading...</span>
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

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
          <Button 
            variant="primary" 
            onClick={handleConfirmApply}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="ms-2">Applying...</span>
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING':
      return 'info';
    case 'ACCEPTED':
      return 'success';
    case 'FAILED':
      return 'danger';
    case 'SCHEDULED':
      return 'info';
    case 'COMPLETED':
      return 'primary';
    default:
      return 'primary';
  }
};

export default CandidateDashboard; 