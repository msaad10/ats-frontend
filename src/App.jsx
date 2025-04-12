import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterCandidate from './pages/RegisterCandidate';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Candidates from './pages/Candidates';
import CandidateDetail from './components/CandidateDetail';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import './App.css';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterJobDetail from './pages/RecruiterJobDetail';
import InterviewerDashboard from './pages/InterviewerDashboard';
import Layout from './components/Layout';
import './styles/global.css';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/candidate" element={<RegisterCandidate />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={['CANDIDATE', 'RECRUITER']}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <PrivateRoute allowedRoles={['CANDIDATE', 'RECRUITER']}>
                  <Jobs />
                </PrivateRoute>
              }
            />
            <Route
              path="/jobs/:id"
              element={
                <PrivateRoute allowedRoles={['CANDIDATE', 'RECRUITER']}>
                  <JobDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/candidates"
              element={
                <PrivateRoute allowedRoles={['CANDIDATE', 'RECRUITER']}>
                  <Candidates />
                </PrivateRoute>
              }
            />
            <Route
              path="/candidates/:id"
              element={
                <PrivateRoute allowedRoles={['CANDIDATE', 'RECRUITER']}>
                  <CandidateDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/recruiter/dashboard"
              element={
                <PrivateRoute allowedRoles={['RECRUITER']}>
                  <RecruiterDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/recruiter/jobs/:jobId"
              element={
                <PrivateRoute allowedRoles={['RECRUITER']}>
                  <RecruiterJobDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/candidate/dashboard"
              element={
                <PrivateRoute allowedRoles={['CANDIDATE']}>
                  <CandidateDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/interviewer/dashboard"
              element={
                <PrivateRoute allowedRoles={['INTERVIEWER']}>
                  <InterviewerDashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
