import { Card, Button, Container } from 'react-bootstrap'

const Home = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <Container>
        <div className="text-center">
          <h1 className="display-4 mb-4">Welcome to ATS Frontend</h1>
          <Card className="mx-auto" style={{ maxWidth: '600px' }}>
            <Card.Body>
              <Card.Title className="h3">Application Tracking System</Card.Title>
              <Card.Text className="lead">
                This is a modern React application built with Vite, React Router, and Bootstrap.
                Start building your application by modifying the components in the src directory.
              </Card.Text>
              <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                <Button variant="primary" size="lg" href="/login">
                  Login
                </Button>
                <Button variant="outline-secondary" size="lg" href="/register">
                  Register
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  )
}

export default Home 