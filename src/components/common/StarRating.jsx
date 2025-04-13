import React from 'react';
import { Form } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import { theme } from '../../styles/theme';

const StarRating = ({ label, value, onChange, required }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <Form.Group className="mb-3">
      <Form.Label>
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      <div className="d-flex align-items-center gap-2">
        {stars.map((star) => (
          <FaStar
            key={star}
            className="cursor-pointer"
            size={24}
            color={star <= value ? theme.colors.primary : '#e4e5e9'}
            onClick={() => onChange(star)}
            style={{ cursor: 'pointer' }}
          />
        ))}
        <span className="ms-2 text-muted">{value} / 5</span>
      </div>
    </Form.Group>
  );
};

export default StarRating; 