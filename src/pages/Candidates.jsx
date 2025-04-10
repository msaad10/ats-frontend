import { Container } from 'react-bootstrap';
import { Routes, Route, Link } from 'react-router-dom';
import CandidateList from '../components/candidates/CandidateList';
import CandidateDetail from '../components/candidates/CandidateDetail';
import { useAuth } from '../context/AuthContext';

const Candidates = () => {
  const { user } = useAuth();

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Candidates</h1>
        {user && (user.role === 'ADMIN' || user.role === 'RECRUITER') && (
          <Link to="/candidates/new" className="btn btn-primary">
            Add New Candidate
          </Link>
        )}
      </div>

      <Routes>
        <Route path="/" element={<CandidateList />} />
        <Route path="/:id" element={<CandidateDetail />} />
      </Routes>
    </Container>
  );
};

export default Candidates; 