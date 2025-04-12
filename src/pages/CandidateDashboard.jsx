import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jobService from '../services/jobService';
import candidateService from '../services/candidateService';
import StyledTable from '../components/common/StyledTable';
import { theme } from '../styles/theme';

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsResponse, appliedJobsResponse] = await Promise.all([
          jobService.getAllJobs(),
          candidateService.getAppliedJobs(user.id)
        ]);
        setJobs(jobsResponse);
        setAppliedJobs(appliedJobsResponse);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setUploadError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', resumeFile);
      await candidateService.uploadResume(formData);
      
      setShowResumeModal(false);
      setResumeFile(null);
      setSuccess('Resume uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
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

      await candidateService.applyForJob({
        jobId: selectedJob.id,
        userId: user.id
      });
      
      const [jobsResponse, appliedJobsResponse] = await Promise.all([
        jobService.getJobs(),
        candidateService.getAppliedJobs(user.id)
      ]);

      setJobs(jobsResponse);
      setAppliedJobs(appliedJobsResponse);
      
      setShowModal(false);
      setSelectedJob(null);
      setSuccess('Successfully applied for the job!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply for job');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      {/* Resume Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0" style={{ color: theme.colors.text.primary }}>Resume</h5>
                <Button 
                  className="btn-gradient"
                  size="sm"
                  onClick={() => setShowResumeModal(true)}
                >
                  Upload Resume
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <p style={{ color: theme.colors.text.secondary }}>
                {appliedJobs?.length > 0 
                  ? 'Your resume has been uploaded and is being used for job applications.'
                  : 'Upload your resume to start applying for jobs.'}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Jobs Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-1" style={{ color: theme.colors.text.primary }}>Recent Jobs</h5>
                <Button 
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigate('/jobs')}
                  style={{ 
                    border: '1px solid #e5e7eb',
                    color: theme.colors.text.primary,
                    background: 'white',
                    boxShadow: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: '#f9fafb',
                      borderColor: theme.colors.primary.main
                    }
                  }}
                >
                  View All Jobs
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
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.slice(0, 5).map(job => (
                    <tr key={job.id}>
                      <td style={{ color: theme.colors.text.primary }}>{job.title}</td>
                      <td style={{ color: theme.colors.text.secondary }}>{job.department}</td>
                      <td style={{ color: theme.colors.text.secondary }}>{job.location}</td>
                      <td>
                        <Badge style={{ 
                          background: job.status === 'OPEN' ? theme.colors.primary.gradientButton : 'linear-gradient(to right, #6c757d, #495057)'
                        }}>
                          {job.status}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          className="btn-gradient"
                          size="sm"
                          onClick={() => handleApplyJob(job)}
                          disabled={appliedJobs?.some(applied => applied.jobId === job.id)}
                        >
                          {appliedJobs?.some(applied => applied.jobId === job.id) ? 'Applied' : 'Apply'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Applied Jobs Section */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0" style={{ color: theme.colors.text.primary }}>Applied Jobs</h5>
            </Card.Header>
            <Card.Body>
              <StyledTable>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Department</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appliedJobs.map(job => (
                    <tr key={job.id}>
                      <td style={{ color: theme.colors.text.primary }}>{job.jobTitle}</td>
                      <td style={{ color: theme.colors.text.secondary }}>{job.jobDepartment	}</td>
                      <td style={{ color: theme.colors.text.secondary }}>
                        {new Date(job.appliedAt	).toLocaleDateString()}
                      </td>
                      <td>
                        <Badge style={{ 
                          background: job.currentStage === 'APPLIED' ? 'linear-gradient(to right, #0088cc, #00a3cc)' :
                                    job.currentStage === 'HIRED' ? 'linear-gradient(to right, #28a745, #20c997)' :
                                    job.currentStage === 'REJECTED' ? 'linear-gradient(to right, #dc3545, #c82333)' :
                                    theme.colors.primary.gradientButton
                        }}>
                          {job.currentStage}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resume Upload Modal */}
      <Modal show={showResumeModal} onHide={() => setShowResumeModal(false)}>
        <Modal.Header closeButton style={{ background: `rgb(106, 17, 203)`, borderBottom: '1px solid #e5e7eb' }}>
          <Modal.Title style={{ color: theme.colors.text.primary, fontSize: '1.25rem', fontWeight: 500 }}>
            Upload Resume
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'white' }}>
          <Form>
            <Form.Group controlId="resumeFile" className="mb-3">
              <Form.Label style={{ color: theme.colors.text.primary, fontWeight: 500 }}>
                Select Resume (PDF)
              </Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
                style={{ 
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.5rem'
                }}
              />
              <Form.Text style={{ color: theme.colors.text.secondary }}>
                Supported formats: PDF, DOC, DOCX
              </Form.Text>
            </Form.Group>
            {uploadError && <Alert variant="danger">{uploadError}</Alert>}
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: 'white', borderTop: '1px solid #e5e7eb' }}>
          <Button 
            onClick={() => setShowResumeModal(false)}
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
            onClick={handleResumeUpload}
            disabled={uploading || !resumeFile}
            style={{
              border: 'none',
              padding: '0.5rem 1rem',
              fontWeight: 500
            }}
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
        <Modal.Header closeButton style={{ background: `rgb(106, 17, 203)`, borderBottom: '1px solid #e5e7eb' }}>
          <Modal.Title style={{ color: theme.colors.text.primary, fontSize: '1.25rem', fontWeight: 500 }}>
            Confirm Application
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'white', color: theme.colors.text.primary }}>
          <p className="mb-0">Are you sure you want to apply for <strong>{selectedJob?.title}</strong>?</p>
        </Modal.Body>
        <Modal.Footer style={{ background: 'white', borderTop: '1px solid #e5e7eb' }}>
          <Button 
            onClick={() => setShowModal(false)}
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
            onClick={handleConfirmApply}
            disabled={loading}
            style={{
              border: 'none',
              padding: '0.5rem 1rem',
              fontWeight: 500
            }}
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

export default CandidateDashboard; 