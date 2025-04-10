import { Card, Badge, Button, ListGroup } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  // Mock data for testing
  const job = {
    id: parseInt(id),
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'Remote',
    status: 'PUBLISHED',
    description: 'We are looking for a Senior Software Engineer to join our team. The ideal candidate will have experience with React, Node.js, and cloud technologies.',
    requirements: [
      '5+ years of software development experience',
      'Strong knowledge of React and Node.js',
      'Experience with cloud platforms (AWS/GCP)',
      'Excellent problem-solving skills',
      'Strong communication and teamwork abilities'
    ],
    responsibilities: [
      'Design and implement scalable web applications',
      'Collaborate with cross-functional teams',
      'Write clean, maintainable code',
      'Participate in code reviews',
      'Mentor junior developers'
    ],
    benefits: [
      'Competitive salary and equity',
      'Health, dental, and vision insurance',
      '401(k) matching',
      'Flexible work hours',
      'Remote work options',
      'Professional development budget'
    ],
    postedDate: '2024-03-01',
    applicationDeadline: '2024-04-30'
  };

  const getStatusBadge = (status) => {
    const variants = {
      DRAFT: 'secondary',
      PUBLISHED: 'success',
      CLOSED: 'danger',
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="job-detail">
      <div className="job-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="mb-2">{job.title}</h1>
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted">
                <i className="fas fa-building me-2"></i>
                {job.department}
              </span>
              <span className="text-muted">
                <i className="fas fa-map-marker-alt me-2"></i>
                {job.location}
              </span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button as={Link} to="/jobs" variant="outline-secondary">
              Back to Jobs
            </Button>
            {(user?.role === 'ADMIN' || user?.role === 'RECRUITER') && (
              <Button as={Link} to={`/jobs/${id}/edit`} variant="primary">
                Edit Job
              </Button>
            )}
          </div>
        </div>
        <div className="mt-3">
          {getStatusBadge(job.status)}
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="section-title">Job Description</Card.Title>
              <p className="description-text">{job.description}</p>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="section-title">Requirements</Card.Title>
              <ListGroup variant="flush">
                {job.requirements.map((req, index) => (
                  <ListGroup.Item key={index} className="requirement-item">
                    <i className="fas fa-check-circle me-2 text-success"></i>
                    {req}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="section-title">Responsibilities</Card.Title>
              <ListGroup variant="flush">
                {job.responsibilities.map((resp, index) => (
                  <ListGroup.Item key={index} className="responsibility-item">
                    <i className="fas fa-tasks me-2 text-primary"></i>
                    {resp}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="section-title">Job Details</Card.Title>
              <div className="job-details">
                <div className="detail-item">
                  <i className="fas fa-calendar-alt me-2"></i>
                  <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-clock me-2"></i>
                  <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-users me-2"></i>
                  <span>Department: {job.department}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  <span>Location: {job.location}</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="section-title">Benefits</Card.Title>
              <ListGroup variant="flush">
                {job.benefits.map((benefit, index) => (
                  <ListGroup.Item key={index} className="benefit-item">
                    <i className="fas fa-star me-2 text-warning"></i>
                    {benefit}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          <Button variant="primary" className="w-100" size="lg">
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobDetail; 