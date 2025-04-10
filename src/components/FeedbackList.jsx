import React from 'react';
import { Card } from 'react-bootstrap';
import Rating from 'react-rating';
import { format } from 'date-fns';

const FeedbackList = ({ feedbacks }) => {
  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="feedback-list">
        <p>No feedback available yet.</p>
      </div>
    );
  }

  return (
    <div className="feedback-list">
      <h4>Feedback History</h4>
      {feedbacks.map((feedback) => (
        <Card key={feedback.id} className="mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <strong>{feedback.interviewerName}</strong>
                <span className="text-muted ms-2">
                  {format(new Date(feedback.date), 'MMM d, yyyy')}
                </span>
              </div>
              <Rating
                initialRating={feedback.rating}
                readonly
                emptySymbol="fa fa-star-o fa-2x"
                fullSymbol="fa fa-star fa-2x"
              />
            </div>
            <p className="mb-0">{feedback.comments}</p>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default FeedbackList; 