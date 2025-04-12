import { useState } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { theme } from '../../styles/theme';

const JobList = () => {
  // Mock data for testing
  const [jobs] = useState([
    {
      id: 1,
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'Remote',
      status: 'PUBLISHED',
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'New York',
      status: 'DRAFT',
    },
    {
      id: 3,
      title: 'UX Designer',
      department: 'Design',
      location: 'San Francisco',
      status: 'CLOSED',
    },
  ]);

  const getStatusBadge = (status) => {
    return (
      <Badge style={{ 
        background: status === 'PUBLISHED' ? theme.colors.primary.gradientButton :
                  status === 'DRAFT' ? 'linear-gradient(to right, #6c757d, #495057)' :
                  'linear-gradient(to right, #dc3545, #c82333)'
      }}>
        {status}
      </Badge>
    );
  };

  return (
    <Table striped hover responsive>
      <thead>
        <tr>
          <th>Title</th>
          <th>Department</th>
          <th>Location</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <tr key={job.id}>
            <td>{job.title}</td>
            <td>{job.department}</td>
            <td>{job.location}</td>
            <td>{getStatusBadge(job.status)}</td>
            <td>
              <div className="d-flex gap-2">
                <Button
                  as={Link}
                  to={`/jobs/${job.id}`}
                  className="btn-gradient"
                  size="sm"
                  style={{
                    border: 'none',
                    padding: '0.5rem 1rem',
                    fontWeight: 500
                  }}
                >
                  View
                </Button>
                <Button
                  as={Link}
                  to={`/jobs/${job.id}/edit`}
                  className="btn-gradient"
                  size="sm"
                  style={{
                    border: 'none',
                    padding: '0.5rem 1rem',
                    fontWeight: 500
                  }}
                >
                  Edit
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default JobList; 