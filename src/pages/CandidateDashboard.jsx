import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jobService from '../services/jobService';
import candidateService from '../services/candidateService';
import StyledTable from '../components/common/StyledTable';
import { theme } from '../styles/theme';
import { FaEye, FaStar } from 'react-icons/fa';
import StarRating from '../components/common/StarRating';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFeedbackDetailsModal, setShowFeedbackDetailsModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [candidateInterviews, setCandidateInterviews] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsResponse, recentJobsResponse, appliedJobsResponse] = await Promise.all([
          jobService.getAllJobs(),
          jobService.getRecentJobs(),
          candidateService.getAppliedJobs(user.id)
        ]);
        setJobs(jobsResponse);
        setRecentJobs(recentJobsResponse);
        setAppliedJobs(appliedJobsResponse);
      } catch (err) {
        console.error('Error fetching data:', err);
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
      setShowModal(false);
      await candidateService.applyForJob({
        jobId: selectedJob.id,
        userId: user.id
      });
      
      const [jobsResponse, appliedJobsResponse] = await Promise.all([
        jobService.getAllJobs(),
        candidateService.getAppliedJobs(user.id)
      ]);

      setJobs(jobsResponse);
      setAppliedJobs(appliedJobsResponse);
      
      
      setSelectedJob(null);
      setSuccess('Successfully applied for the job!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || 'Please upload resume first');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFeedback = async (job) => {
    try {
      setLoadingFeedback(true);
      setFeedbackError('');
      const response = await candidateService.getCandidateInterviews(job.id);
      setCandidateInterviews(response);
      setShowFeedbackModal(true);
    } catch (err) {
      setFeedbackError('Failed to fetch interview details');
      console.error(err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleViewFeedbackDetails = (interview) => {
    setSelectedFeedback(interview);
    setShowFeedbackDetailsModal(true);
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
                  {recentJobs.map(job => (
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

                      {appliedJobs?.some(applied => applied.jobId === job.id) ? (
                        <td>
                        <Badge style={{ 
                          background:'linear-gradient(to right, #0088cc, #00a3cc)'
                        }}>
                          APPLIED
                        </Badge>
                      </td>
                      ):(
                        <td>
                        <Button
                          className="btn-gradient"
                          size="sm"
                          onClick={() => handleApplyJob(job)}
                          disabled={appliedJobs?.some(applied => applied.jobId === job.id)}
                        >
                          Apply
                        </Button>
                      </td>
                      )}
                      
                      
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
                   <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appliedJobs.map((job) => (
                    <tr key={job.id}>
                      <td style={{ color: theme.colors.text.primary }}>{job.jobTitle}</td>
                      <td style={{ color: theme.colors.text.secondary }}>{job.jobDepartment}</td>
                      <td style={{ color: theme.colors.text.secondary }}>
                        {new Date(job.appliedAt).toLocaleDateString()}
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
                      {job.currentStage !== 'APPLIED' ? (
                         <td>
                         <div className="d-flex gap-2">
                           <OverlayTrigger
                             placement="top"
                             overlay={<Tooltip>View Feedback</Tooltip>}
                           >
                             <Button
                               className="btn-gradient"
                               size="sm"
                               onClick={() => handleViewFeedback(job)}
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
                         </div>
                       </td>
                      ) : (
                          <td>
                          <div className="d-flex gap-2">
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Feedback not available</Tooltip>}
                            >
                              <Button
                                className="btn-gradient"
                                size="sm"
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
                          </div>
                        </td>
                      )}

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
          <Modal.Title style={{ color: theme.colors.text.light, fontSize: '1.25rem', fontWeight: 500 }}>
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
                Supported formats: PDF
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
          <Modal.Title style={{ color: theme.colors.text.light, fontSize: '1.25rem', fontWeight: 500 }}>
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

      {/* Feedback Modal */}
      <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)} size="lg">
        <Modal.Header closeButton style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
          <Modal.Title style={{ color: theme.colors.text.primary, fontSize: '1.25rem', fontWeight: 500 }}>
            Interview Feedback
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
                  <th>Actions</th>
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
                    <td>
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
                        View Details
                      </Button>
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
                  background: selectedFeedback.result === 'PASS' ? 'linear-gradient(to right, #28a745, #20c997)' :
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
                              color={star <= score.score ? theme.colors.primary : '#e4e5e9'}
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

export default CandidateDashboard; 