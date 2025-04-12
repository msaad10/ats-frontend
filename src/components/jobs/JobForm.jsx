import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/jobService';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  department: yup.string().required('Department is required'),
  location: yup.string().required('Location is required'),
  description: yup.string().required('Description is required'),
  requirements: yup.string().required('Requirements are required'),
  status: yup.string().oneOf(['DRAFT', 'PUBLISHED', 'CLOSED']).required('Status is required'),
});

const JobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const response = await jobService.getJobById(id);
      const job = response.data;
      Object.keys(job).forEach((key) => {
        setValue(key, job[key]);
      });
    } catch (err) {
      console.log(err, "err")
      setError('Failed to load job');
    }
  };

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      if (id) {
        await jobService.updateJob(id, data);
      } else {
        await jobService.createJob(data);
      }
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'RECRUITER')) {
    return <Alert variant="danger">You do not have permission to access this page.</Alert>;
  }

  return (
    <div className="job-form">
      <h2 className="mb-4">{id ? 'Edit Job' : 'Create New Job'}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            {...register('title')}
            isInvalid={!!errors.title}
            placeholder="Enter job title"
          />
          <Form.Control.Feedback type="invalid">
            {errors.title?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Department</Form.Label>
          <Form.Control
            type="text"
            {...register('department')}
            isInvalid={!!errors.department}
            placeholder="Enter department"
          />
          <Form.Control.Feedback type="invalid">
            {errors.department?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            {...register('location')}
            isInvalid={!!errors.location}
            placeholder="Enter location"
          />
          <Form.Control.Feedback type="invalid">
            {errors.location?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            {...register('description')}
            isInvalid={!!errors.description}
            placeholder="Enter job description"
          />
          <Form.Control.Feedback type="invalid">
            {errors.description?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Requirements</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            {...register('requirements')}
            isInvalid={!!errors.requirements}
            placeholder="Enter job requirements"
          />
          <Form.Control.Feedback type="invalid">
            {errors.requirements?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select {...register('status')} isInvalid={!!errors.status}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CLOSED">Closed</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.status?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <div className="d-flex gap-2">
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/jobs')}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default JobForm; 