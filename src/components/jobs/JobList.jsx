import { useState } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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
    const variants = {
      DRAFT: 'secondary',
      PUBLISHED: 'success',
      CLOSED: 'danger',
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
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
              <Button
                as={Link}
                to={`/jobs/${job.id}`}
                variant="outline-primary"
                size="sm"
                className="me-2"
              >
                View
              </Button>
              <Button
                as={Link}
                to={`/jobs/${job.id}/edit`}
                variant="outline-secondary"
                size="sm"
              >
                Edit
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default JobList; 