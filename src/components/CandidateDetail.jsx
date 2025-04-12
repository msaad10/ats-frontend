import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Container, Row, Col, Badge } from 'react-bootstrap';
import FeedbackForm from './FeedbackForm';
import FeedbackList from './FeedbackList';
import { useAuth } from '../context/AuthContext';
import { getCandidateFeedback } from '../services/feedbackService';

const CandidateDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCandidateAndFeedback = async () => {
      try {
        const [candidateData, feedbackData] = await Promise.all([
          getCandidateById(id),
          getCandidateFeedback(id)
        ]);
        setCandidate(candidateData);
        setFeedbacks(feedbackData);
      } catch (err) {
        setError('Failed to load candidate data');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateAndFeedback();
  }, [id]);

  const handleFeedbackSubmitted = async () => {
    try {
      const feedbackData = await getCandidateFeedback(id);
      setFeedbacks(feedbackData);
    } catch (err) {
      setError('Failed to refresh feedback');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!candidate) return <div>Candidate not found</div>;

  return (
    <Container className="py-4">
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center">
                <h2>{candidate.name}</h2>
                <Badge bg="info">{candidate.status}</Badge>
              </Card.Title>
              
              <div className="mb-3">
                <h5>Contact Information</h5>
                <p>Email: {candidate.email}</p>
                <p>Phone: {candidate.phone}</p>
              </div>

              <div className="mb-3">
                <h5>Skills</h5>
                <div className="d-flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <Badge key={index} bg="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h5>Experience</h5>
                <p>{candidate.experience}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {currentUser.role === 'INTERVIEWER' && (
            <FeedbackForm 
              candidateId={id} 
              onFeedbackSubmitted={handleFeedbackSubmitted}
            />
          )}
          
          <FeedbackList feedbacks={feedbacks} />
        </Col>
      </Row>
    </Container>
  );
};

export default CandidateDetail; 