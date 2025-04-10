import { Container } from 'react-bootstrap';
import { Routes, Route, Link } from 'react-router-dom';
import JobList from '../components/jobs/JobList';
import JobDetail from '../components/jobs/JobDetail';
import JobForm from '../components/jobs/JobForm';

const Jobs = () => {
  // For testing purposes, we'll simulate a logged-in user with RECRUITER role
  const mockUser = { role: 'RECRUITER' };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Job Postings</h1>
        <Link to="/jobs/new" className="btn btn-primary">
          Create New Job
        </Link>
      </div>

      <Routes>
        <Route path="/" element={<JobList />} />
        <Route path="/new" element={<JobForm />} />
        <Route path="/:id" element={<JobDetail />} />
        <Route path="/:id/edit" element={<JobForm />} />
      </Routes>
    </Container>
  );
};

export default Jobs; 