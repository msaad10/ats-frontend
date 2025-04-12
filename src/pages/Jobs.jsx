import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Alert, Spinner, Badge, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jobService from '../services/jobService';
import candidateService from '../services/candidateService';

const Jobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsResponse, appliedJobsResponse] = await Promise.all([
          jobService.getAllJobs(),
          user.role === 'CANDIDATE' ? candidateService.getAppliedJobs(user.id) : Promise.resolve([])
        ]);
        setJobs(jobsResponse);
        setAppliedJobs(appliedJobsResponse);
      } catch (err) {
        setError('Failed to fetch jobs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleApplyJob = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleConfirmApply = async () => {
    try {
      setApplying(true);
      setError(null);

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
      setApplying(false);
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

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>All Jobs</h2>
            {user.role === 'RECRUITER' && (
              <Button 
                variant="primary"
                onClick={() => navigate('/recruiter/jobs/create')}
              >
                Create New Job
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Title</th>
                <th>Department</th>
                <th>Location</th>
                <th>Status</th>
                {user.role === 'CANDIDATE' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.department}</td>
                  <td>{job.location}</td>
                  <td>
                    <Badge bg={job.status === 'OPEN' ? 'success' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </td>
                  {user.role === 'CANDIDATE' && (
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApplyJob(job)}
                        disabled={appliedJobs?.some(applied => applied.jobId === job.id)}
                      >
                        {appliedJobs?.some(applied => applied.jobId === job.id) ? 'Applied' : 'Apply'}
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

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
            disabled={applying}
          >
            {applying ? (
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

export default Jobs; 