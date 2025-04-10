import { Link } from 'react-router-dom'
import { Card, Button } from 'react-bootstrap'

const NotFound = () => {
  return (
    <div className="text-center">
      <h1 className="mb-4">404 - Page Not Found</h1>
      <Card className="mx-auto" style={{ maxWidth: '600px' }}>
        <Card.Body>
          <Card.Title>Oops! Page not found</Card.Title>
          <Card.Text>
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </Card.Text>
          <Button as={Link} to="/" variant="primary">Go to Homepage</Button>
        </Card.Body>
      </Card>
    </div>
  )
}

export default NotFound 