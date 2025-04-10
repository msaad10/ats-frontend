import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import Rating from 'react-rating';
import { useAuth } from '../context/AuthContext';
import { createFeedback } from '../services/feedbackService';

const FeedbackForm = ({ candidateId, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(3);
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Submitting feedback:', {
        candidateId,
        interviewerId: user.id,
        rating,
        comments,
        date: new Date().toISOString()
      });

      const response = await createFeedback({
        candidateId,
        interviewerId: user.id,
        rating,
        comments,
        date: new Date().toISOString()
      });
      
      console.log('Feedback submitted successfully:', response);
      setComments('');
      setRating(3);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-form mb-4">
      <h4>Submit Feedback</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Rating</Form.Label>
          <div className="d-flex align-items-center">
            <Rating
              initialRating={rating}
              onChange={setRating}
              emptySymbol="far fa-star fa-lg"
              fullSymbol="fas fa-star fa-lg"
              className="me-2 rating-stars"
            />
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Comments</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            required
            placeholder="Enter your feedback comments..."
          />
        </Form.Group>

        <Button 
          type="submit" 
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </Form>
    </div>
  );
};

export default FeedbackForm; 