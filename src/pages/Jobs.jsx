import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Alert, Spinner, Badge, Table, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jobService from '../services/jobService';
import candidateService from '../services/candidateService';
import { theme } from '../styles/theme';
import StyledTable from '../components/common/StyledTable';

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
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

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
  }, [user, navigate]);

  // Get unique departments from jobs
  const departments = [...new Set(jobs.map(job => job.department))];

  // Filter and sort jobs based on selected department, search term, and sort order
  const filteredJobs = jobs
    .filter(job => {
      const matchesDepartment = !selectedDepartment || job.department === selectedDepartment;
      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDepartment && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

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
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
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
                className="btn-gradient"
                onClick={() => navigate('/recruiter/jobs/create')}
                style={{
                  border: 'none',
                  padding: '0.5rem 1rem',
                  fontWeight: 500
                }}
              >
                Create New Job
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Card>
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0" style={{ color: theme.colors.text.primary }}>Available Jobs</h5>
            <div className="d-flex gap-3">
              <Form.Control
                type="text"
                placeholder="Search by job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '250px',
                  border: '1px solid rgb(30, 40, 59)',
                  borderRadius: '0.375rem',
                  padding: '0.5rem',
                  background: 'white'
                }}
              />
              <Form.Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                style={{ 
                  width: '200px',
                  border: '1px solid rgb(30, 40, 59)',
                  borderRadius: '0.375rem',
                  padding: '0.5rem'
                }}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Form.Select>
              <Form.Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ 
                  width: '200px',
                  border: '1px solid rgb(30, 40, 59)',
                  borderRadius: '0.375rem',
                  padding: '0.5rem'
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </Form.Select>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <StyledTable>
            <thead>
              <tr>
                <th>Title</th>
                <th>Department</th>
                <th>Location</th>
                <th>Date Posted</th>
                <th>Status</th>
                {user.role === 'CANDIDATE' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => (
                <tr key={job.id}>
                  <td style={{ color: theme.colors.text.primary }}>{job.title}</td>
                  <td style={{ color: theme.colors.text.secondary }}>{job.department}</td>
                  <td style={{ color: theme.colors.text.secondary }}>{job.location}</td>
                  <td style={{ color: theme.colors.text.secondary }}>
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <Badge style={{ 
                      background: job.status === 'OPEN' ? theme.colors.primary.gradientButton : 'linear-gradient(to right, #6c757d, #495057)'
                    }}>
                      {job.status}
                    </Badge>
                  </td>
                  {user.role === 'CANDIDATE' && (
                    <td>
                      <Button
                        className="btn-gradient"
                        size="sm"
                        onClick={() => handleApplyJob(job)}
                        disabled={appliedJobs?.some(applied => applied.jobId === job.id)}
                        style={{
                          border: 'none',
                          padding: '0.5rem 1rem',
                          fontWeight: 500,
                          background: appliedJobs?.some(applied => applied.jobId === job.id) ? 'btn-gradient' : 'linear-gradient(to right, #28a745, #20c997)'
                        }}
                      >
                        {appliedJobs?.some(applied => applied.jobId === job.id) ? 'Applied' : 'Apply'}
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </Card.Body>
      </Card>

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
            disabled={applying}
            style={{
              border: 'none',
              padding: '0.5rem 1rem',
              fontWeight: 500
            }}
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