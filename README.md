# ATS (Applicant Tracking System)

A modern Applicant Tracking System built with React, Node.js, and MongoDB.

## Features

### Authentication
- User registration and login
- Role-based access control (Candidate, Recruiter, Interviewer)
- Secure password handling
- Session management

### Candidate Features
- Job search and filtering
- Job application management
- Profile management
- Interview scheduling
- Application status tracking
- Skills management
- Resume upload and management

### Recruiter Features
- Job posting and management
- Candidate screening
- Interview scheduling
- Application review
- Candidate communication
- Job status management
- Interview feedback review

### Interviewer Features
- Interview scheduling
- Candidate evaluation
- Feedback submission
- Rating system for different interview types
- Interview history tracking

### Admin Features
- User management
- System configuration
- Analytics and reporting
- Role management

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Backend Setup
1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd ats-backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
5. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ats-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Register as a candidate, recruiter, or interviewer
3. Log in with your credentials
4. Access the dashboard based on your role

## Technologies Used

### Frontend
- React.js
- React Router
- React Bootstrap
- Axios
- Context API
- Custom Hooks

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
