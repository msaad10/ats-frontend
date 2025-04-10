import { useState, useEffect } from 'react';
import { Table, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Mock data for testing
  useEffect(() => {
    const mockCandidates = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        jobTitle: 'Senior Software Engineer',
        stage: 'INTERVIEWING',
        appliedDate: '2024-03-15',
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        jobTitle: 'Product Manager',
        stage: 'SCREENED',
        appliedDate: '2024-03-10',
      },
      {
        id: 3,
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        jobTitle: 'UX Designer',
        stage: 'APPLIED',
        appliedDate: '2024-03-20',
      },
    ];
    setCandidates(mockCandidates);
    setLoading(false);
  }, []);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <Table striped hover responsive>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Job Applied</th>
          <th>Stage</th>
          <th>Applied Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {candidates.map((candidate) => (
          <tr key={candidate.id}>
            <td>{`${candidate.firstName} ${candidate.lastName}`}</td>
            <td>{candidate.email}</td>
            <td>{candidate.jobTitle}</td>
            <td>{getStageBadge(candidate.stage)}</td>
            <td>{new Date(candidate.appliedDate).toLocaleDateString()}</td>
            <td>
              <Button
                as={Link}
                to={`/candidates/${candidate.id}`}
                variant="primary"
                size="sm"
                className="me-2"
              >
                View
              </Button>
              {(user?.role === 'ADMIN' || user?.role === 'RECRUITER') && (
                <Button
                  as={Link}
                  to={`/candidates/${candidate.id}/edit`}
                  variant="outline-secondary"
                  size="sm"
                >
                  Edit
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default CandidateList; 