import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveAs } from 'file-saver';
import jobService from '../services/jobService';
import candidateService from '../services/candidateService';

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [interviewers, setInterviewers] = useState([]);
  const [interviewForm, setInterviewForm] = useState({
    interviewerId: '',
    interviewType: 'TECHNICAL',
    scheduledDate: '',
    notes: ''
  });
  const [jobForm, setJobForm] = useState({
    title: '',
    department: '',
    location: '',
    description: '',
    status: 'OPEN'
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'Human Resources',
    'Finance',
    'Operations',
    'IT',
    'Customer Service'
  ];

  const locations = ['Karachi', 'Lahore', 'Islamabad'];

  useEffect(() => {
    if (!user || user.role !== 'RECRUITER') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [jobsResponse, interviewersResponse] = await Promise.all([
          jobService.getAllJobs(),
          // candidateService.getInterviewers()
        ]);
        setJobs(jobsResponse);
        // setInterviewers(interviewersResponse.data);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
  };

  const handleViewJob = (job) => {
    navigate(`/recruiter/jobs/${job.id}`);
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const response = await jobService.createJob(jobForm);
      setJobs([...jobs, response.data]);
      setShowJobModal(false);
      setJobForm({
        title: '',
        department: '',
        location: '',
        description: '',
        status: 'OPEN'
      });
    } catch (err) {
      setError('Failed to create job');
    }
  };

  const handleDownloadResume = async (candidateId) => {
    try {
      const response = await candidateService.getResume(candidateId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(blob, `resume-${candidateId}.pdf`);
    } catch (err) {
      setError('Failed to download resume');
    }
  };

  const handleScheduleInterview = (candidate) => {
    setSelectedCandidate(candidate);
    setShowInterviewModal(true);
  };

  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await candidateService.scheduleInterview({
        ...interviewForm,
        candidateId: selectedCandidate.id,
        jobId: selectedCandidate.jobId
      });
      setShowInterviewModal(false);
      setInterviewForm({
        interviewerId: '',
        interviewType: 'TECHNICAL',
        scheduledDate: '',
        notes: ''
      });
    } catch (err) {
      setError('Failed to schedule interview');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>Recruiter Dashboard</h2>
          {user && (
            <div className="mb-3">
              <p>Welcome, {user.firstName} {user.lastName}</p>
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
            </div>
          )}
          <Button variant="outline-danger" onClick={handleLogout}>
            Logout
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col>
          <Button variant="primary" onClick={() => setShowJobModal(true)}>
            Create New Job
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>Job Listings</h4>
            </Card.Header>
            <Card.Body>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      <td>{job.department}</td>
                      <td>{job.location}</td>
                      <td>{job.status}</td>
                      <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleViewJob(job)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Job Details Modal */}
      <Modal show={showJobDetailsModal} onHide={() => setShowJobDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Job Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <div>
              <h4 className="mb-4">{selectedJob.title}</h4>
              <div className="mb-3">
                <h6 className="text-muted">Department</h6>
                <p>{selectedJob.department}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted">Location</h6>
                <p>{selectedJob.location}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted">Status</h6>
                <p>{selectedJob.status}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted">Description</h6>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedJob.description}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowJobDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Job Creation Modal */}
      <Modal show={showJobModal} onHide={() => setShowJobModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateJob}>
            <Form.Group className="mb-3">
              <Form.Label>Job Title</Form.Label>
              <Form.Control
                type="text"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                placeholder="Enter job title"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Select
                value={jobForm.department}
                onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Select
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                required
              >
                <option value="">Select Location</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                placeholder="Enter job description"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={jobForm.status}
                onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
                required
              >
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit">
              Create Job
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Interview Scheduling Modal */}
      <Modal show={showInterviewModal} onHide={() => setShowInterviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Schedule Interview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleInterviewSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Interviewer</Form.Label>
              <Form.Select
                value={interviewForm.interviewerId}
                onChange={(e) => setInterviewForm({ ...interviewForm, interviewerId: e.target.value })}
                required
              >
                <option value="">Select Interviewer</option>
                {interviewers.map(interviewer => (
                  <option key={interviewer.id} value={interviewer.id}>
                    {interviewer.firstName} {interviewer.lastName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Interview Type</Form.Label>
              <Form.Select
                value={interviewForm.interviewType}
                onChange={(e) => setInterviewForm({ ...interviewForm, interviewType: e.target.value })}
                required
              >
                <option value="TECHNICAL">Technical</option>
                <option value="BEHAVIORAL">Behavioral</option>
                <option value="HR">HR</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date and Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={interviewForm.scheduledDate}
                onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={interviewForm.notes}
                onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Schedule Interview
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default RecruiterDashboard; 