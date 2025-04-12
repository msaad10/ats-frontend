import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { saveAs } from 'file-saver';
import jobService from '../services/jobService';
import candidateService from '../services/candidateService';

const RecruiterJobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobResponse, candidatesResponse] = await Promise.all([
          jobService.getJobById(jobId),
          candidateService.getJobCandidates(jobId)
        ]);
        setJob(jobResponse.data);
        setCandidates(candidatesResponse.data);
      } catch (err) {
        setError('Failed to fetch job details and candidates');
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

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'warning',
      ACCEPTED: 'success',
      REJECTED: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
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
                  {candidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td>{candidate.user.firstName} {candidate.user.lastName}</td>
                      <td>{candidate.user.email}</td>
                      <td>{getStatusBadge(candidate.status)}</td>
                      <td>{new Date(candidate.appliedDate).toLocaleDateString()}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleDownloadResume(candidate.user.id)}
                        >
                          Download Resume
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {candidates.length === 0 && (
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
    </Container>
  );
};

export default RecruiterJobDetail; 