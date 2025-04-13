import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveAs } from 'file-saver';
import jobService from '../services/jobService';
import candidateService from '../services/candidateService';
import interviewService from '../services/interviewService';
import StyledTable from '../components/common/StyledTable';
import { theme } from '../styles/theme';
import RichTextEditor from '../components/common/RichTextEditor';

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
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [editJobForm, setEditJobForm] = useState({
    title: '',
    department: '',
    location: '',
    description: '',
    status: 'OPEN'
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [candidateInterviews, setCandidateInterviews] = useState([]);

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
        if(jobsResponse){
          setJobs(jobsResponse);
        }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!jobForm.title) errors.title = 'Job title is required';
    if (!jobForm.department) errors.department = 'Department is required';
    if (!jobForm.location) errors.location = 'Location is required';
    if (!jobForm.description) errors.description = 'Description is required';
    
    if (Object.keys(errors).length > 0) {
      setError(errors);
      return;
    }

    try {
      setLoading(true);
      // Create the job
      await jobService.createJob(jobForm);
      
      // Close the modal first
      setShowJobModal(false);
      
      // Reset the form
      setJobForm({
        title: '',
        department: '',
        location: '',
        description: '',
        status: 'OPEN'
      });
      
      // Fetch the updated job list
      const jobsResponse = await jobService.getAllJobs();
      if (jobsResponse) {
        setJobs(jobsResponse);
      }
      
      // Redirect to dashboard
      navigate('/recruiter/dashboard');
      
    } catch (err) {
      setError('Failed to create job');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setEditJobForm({
      title: job.title,
      department: job.department,
      location: job.location,
      description: job.description,
      status: job.status
    });
    setShowEditJobModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!editJobForm.title) errors.title = 'Job title is required';
    if (!editJobForm.department) errors.department = 'Department is required';
    if (!editJobForm.location) errors.location = 'Location is required';
    if (!editJobForm.description) errors.description = 'Description is required';
    
    if (Object.keys(errors).length > 0) {
      setError(errors);
      return;
    }

    try {
      setLoading(true);
      // Update the job
      await jobService.updateJob(editingJob.id, editJobForm);
      
      // Close the modal
      setShowEditJobModal(false);
      
      // Fetch the updated job list
      const jobsResponse = await jobService.getAllJobs();
      if (jobsResponse) {
        setJobs(jobsResponse);
      }
    } catch (err) {
      setError('Failed to update job');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFeedback = async (candidate) => {
    try {
      setLoadingFeedback(true);
      setFeedbackError('');
      setSelectedCandidate(candidate);
      const response = await interviewService.getCandidateInterviews(candidate.user.id);
      setCandidateInterviews(response);
      setShowFeedbackModal(true);
    } catch (err) {
      setFeedbackError('Failed to fetch interview details');
      console.error(err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container fluid className="py-4">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header style={{ background: `rgb(100, 96, 104)` }}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0" style={{ color: theme.colors.text.light }}>Active Jobs</h5>
                <Button 
                  className="btn-gradient"
                  onClick={() => setShowJobModal(true)}
                >
                  Create New Job
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <StyledTable>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Location</th>
                    <th>Created Date</th>
                    <th>Status</th>
                    <th>Applications</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id}>
                      <td style={{ color: theme.colors.text.primary }}>{job.title}</td>
                      <td style={{ color: theme.colors.text.secondary }}>{job.department}</td>
                      <td style={{ color: theme.colors.text.secondary }}>{job.location}</td>
                      <td style={{ color: theme.colors.text.secondary }}>{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Badge style={{ 
                          background: job.status === 'OPEN' ? theme.colors.primary.gradientButton :
                                    job.status === 'CLOSED' ? 'linear-gradient(to right, #dc3545, #c82333)' :
                                    'linear-gradient(to right, #6c757d, #495057)'
                        }}>
                          {job.status}
                        </Badge>
                      </td>
                      <td style={{ color: theme.colors.text.secondary }}>{job.applicationCount || 0}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            className="btn-gradient"
                            size="sm"
                            onClick={() => navigate(`/recruiter/jobs/${job.id}`)}
                          >
                            View Details
                          </Button>
                          <Button
                            className="btn-gradient"
                            size="sm"
                            onClick={() => handleEditJob(job)}
                          >
                            Edit
                          </Button>
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

      {/* Job Details Modal */}
      <Modal show={showJobDetailsModal} onHide={() => setShowJobDetailsModal(false)} size="lg">
        <Modal.Header closeButton style={{ background: `rgb(106, 17, 203)` }}>
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
      <Modal show={showJobModal} onHide={() => setShowJobModal(false)} size="lg">
        <Modal.Header closeButton style={{ background: `rgb(106, 17, 203)` }}>
          <Modal.Title>Create New Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
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
              <RichTextEditor
                value={jobForm.description}
                onChange={(value) => setJobForm({ ...jobForm, description: value })}
              />
              {/* <Form.Control
                as="textarea"
                rows={4}
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                placeholder="Enter job description"
                required
              /> */}
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

            <Button className='btn-gradient' type="submit">
              Create Job
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Interview Scheduling Modal */}
      <Modal show={showInterviewModal} onHide={() => setShowInterviewModal(false)}>
        <Modal.Header closeButton style={{ background: `rgb(106, 17, 203)` }}>
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

      {/* Edit Job Modal */}
      <Modal show={showEditJobModal} onHide={() => setShowEditJobModal(false)}>
        <Modal.Header closeButton style={{ background: `rgb(106, 17, 203)`, borderBottom: '1px solid #e5e7eb' }}>
          <Modal.Title style={{ color: theme.colors.text.primary, fontSize: '1.25rem', fontWeight: 500 }}>
            Edit Job
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'white' }}>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editJobForm.title}
                onChange={(e) => setEditJobForm({ ...editJobForm, title: e.target.value })}
                required
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  color: theme.colors.text.primary
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Select
                name="department"
                value={editJobForm.department}
                onChange={(e) => setEditJobForm({ ...editJobForm, department: e.target.value })}
                required
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  color: theme.colors.text.primary
                }}
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
                name="location"
                value={editJobForm.location}
                onChange={(e) => setEditJobForm({ ...editJobForm, location: e.target.value })}
                required
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  color: theme.colors.text.primary
                }}
              >
                <option value="">Select Location</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <RichTextEditor
                value={editJobForm.description}
                onChange={(value) => setEditJobForm({ ...editJobForm, description: value })}
                placeholder="Enter job description..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={editJobForm.status}
                onChange={(e) => setEditJobForm({ ...editJobForm, status: e.target.value })}
                required
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  color: theme.colors.text.primary
                }}
              >
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="DRAFT">Draft</option>
              </Form.Select>
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
                'Update Job'
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Feedback Modal */}
      <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)} size="lg">
        <Modal.Header closeButton style={{ background: `rgb(106, 17, 203)` }}>
          <Modal.Title>
            Interview Feedback for {selectedCandidate?.user.name}
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
                    <td>
                      <Badge bg={interview.result === 'PASS' ? 'success' : 'danger'}>
                        {interview.result || 'Pending'}
                      </Badge>
                    </td>
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

export default RecruiterDashboard; 