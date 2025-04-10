import { Card } from 'react-bootstrap'

const About = () => {
  return (
    <div className="text-center">
      <h1 className="mb-4">About ATS Frontend</h1>
      <Card className="mx-auto" style={{ maxWidth: '800px' }}>
        <Card.Body>
          <Card.Title>About This Project</Card.Title>
          <Card.Text>
            This is a modern React application built with:
            <ul className="list-unstyled mt-3">
              <li>⚡ Vite - Next Generation Frontend Tooling</li>
              <li>⚛️ React - A JavaScript library for building user interfaces</li>
              <li>🛣️ React Router - Declarative routing for React</li>
              <li>🎨 Bootstrap - Popular CSS Framework</li>
              <li>✨ Font Awesome - Icon library and toolkit</li>
            </ul>
          </Card.Text>
        </Card.Body>
      </Card>
    </div>
  )
}

export default About 