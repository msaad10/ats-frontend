import { useState, useEffect } from 'react';
import { Card, Badge, Button, Form, Alert } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FeedbackForm from '../FeedbackForm';
import FeedbackList from '../FeedbackList';

const CandidateDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('');

  // Mock data for testing
  useEffect(() => {
    const mockCandidate = {
      id: parseInt(id),
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      jobTitle: 'Senior Software Engineer',
      stage: 'INTERVIEWING',
      appliedDate: '2024-03-15',
      resumeUrl: '/resumes/john-doe-resume.pdf',
      notes: 'Strong background in React and Node.js. Previous experience at Google.',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
      experience: [
        {
          company: 'Google',
          position: 'Senior Software Engineer',
          duration: '2020 - Present',
          description: 'Led development of internal tools and applications. Implemented microservices architecture.'
        },
        {
          company: 'Microsoft',
          position: 'Software Engineer',
          duration: '2018 - 2020',
          description: 'Developed web applications using React and .NET Core. Collaborated with cross-functional teams.'
        }
      ],
      education: [
        {
          institution: 'Stanford University',
          degree: 'Master of Science in Computer Science',
          duration: '2016 - 2018'
        },
        {
          institution: 'University of California',
          degree: 'Bachelor of Science in Computer Science',
          duration: '2012 - 2016'
        }
      ]
    };

    const mockFeedbacks = [
      {
        id: 1,
        interviewerName: 'Sarah Johnson',
        rating: 4,
        comments: 'Strong technical skills and good communication. Would recommend for the next round.',
        date: '2024-03-20'
      },
      {
        id: 2,
        interviewerName: 'Michael Chen',
        rating: 5,
        comments: 'Excellent problem-solving abilities and team player. Highly recommended.',
        date: '2024-03-22'
      }
    ];

    setCandidate(mockCandidate);
    setFeedbacks(mockFeedbacks);
    setStage(mockCandidate.stage);
    setLoading(false);
  }, [id]);

  const getStageBadge = (stage) => {
    const variants = {
      APPLIED: 'primary',
      SCREENED: 'info',
      INTERVIEWING: 'warning',
      OFFERED: 'success',
      HIRED: 'success',
      REJECTED: 'danger',
    };
    return <Badge bg={variants[stage]}>{stage}</Badge>;
  };

  const handleStageChange = async (newStage) => {
    try {
      setStage(newStage);
      // Here you would make an API call to update the stage
      // await candidateService.updateStage(id, newStage);
    } catch (err) {
      setError('Failed to update stage');
    }
  };

  const handleFeedbackSubmitted = async () => {
    // In a real application, this would fetch new feedback from the API
    console.log('Feedback submitted');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!candidate) return <Alert variant="warning">Candidate not found</Alert>;

  return (
    <div className="candidate-profile">
      <div className="profile-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="mb-1">{`${candidate.firstName} ${candidate.lastName}`}</h1>
            <h4 className="text-muted">{candidate.jobTitle}</h4>
          </div>
          <div className="d-flex gap-2">
            <Button as={Link} to="/candidates" variant="outline-secondary">
              Back to Candidates
            </Button>
            {(user?.role === 'ADMIN' || user?.role === 'RECRUITER') && (
              <Button as={Link} to={`/candidates/${id}/edit`} variant="primary">
                Edit Candidate
              </Button>
            )}
          </div>
        </div>
        <div className="mt-3">
          {getStageBadge(candidate.stage)}
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="section-title">Contact Information</Card.Title>
              <div className="contact-info">
                <div className="info-item">
                  <i className="fas fa-envelope me-2"></i>
                  <span>{candidate.email}</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-phone me-2"></i>
                  <span>{candidate.phone}</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-calendar me-2"></i>
                  <span>Applied: {new Date(candidate.appliedDate).toLocaleDateString()}</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="section-title">Professional Summary</Card.Title>
              <p className="summary-text">{candidate.notes}</p>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="section-title">Skills</Card.Title>
              <div className="skills-list">
                {candidate.skills.map((skill, index) => (
                  <Badge key={index} bg="secondary" className="skill-badge">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="section-title">Work Experience</Card.Title>
              {candidate.experience.map((exp, index) => (
                <div key={index} className="experience-item mb-3">
                  <h5 className="mb-1">{exp.position}</h5>
                  <div className="text-muted mb-2">
                    <span>{exp.company}</span>
                    <span className="mx-2">•</span>
                    <span>{exp.duration}</span>
                  </div>
                  <p className="mb-0">{exp.description}</p>
                </div>
              ))}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="section-title">Education</Card.Title>
              {candidate.education.map((edu, index) => (
                <div key={index} className="education-item mb-3">
                  <h5 className="mb-1">{edu.degree}</h5>
                  <div className="text-muted">
                    <span>{edu.institution}</span>
                    <span className="mx-2">•</span>
                    <span>{edu.duration}</span>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="section-title">Resume</Card.Title>
              <Button
                href={candidate.resumeUrl}
                variant="outline-primary"
                className="w-100 mb-3"
                target="_blank"
              >
                <i className="fas fa-download me-2"></i>
                Download Resume
              </Button>
              {(user?.role === 'ADMIN' || user?.role === 'RECRUITER') && (
                <Form.Group>
                  <Form.Label>Upload New Resume</Form.Label>
                  <Form.Control type="file" accept=".pdf,.doc,.docx" />
                </Form.Group>
              )}
            </Card.Body>
          </Card>

          {(user?.role === 'ADMIN' || user?.role === 'RECRUITER') && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title className="section-title">Update Stage</Card.Title>
                <Form.Select
                  value={stage}
                  onChange={(e) => handleStageChange(e.target.value)}
                >
                  <option value="APPLIED">Applied</option>
                  <option value="SCREENED">Screened</option>
                  <option value="INTERVIEWING">Interviewing</option>
                  <option value="OFFERED">Offered</option>
                  <option value="HIRED">Hired</option>
                  <option value="REJECTED">Rejected</option>
                </Form.Select>
              </Card.Body>
            </Card>
          )}

          <FeedbackForm 
            candidateId={id} 
            onFeedbackSubmitted={handleFeedbackSubmitted}
          />

          <FeedbackList feedbacks={feedbacks} />
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail; 