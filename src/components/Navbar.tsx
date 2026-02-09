import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My App
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/users">
            Users
          </Button>
          <Button color="inherit" component={Link} to="/products">
            Products
          </Button>
          <Button color="inherit" component={Link} to="/categories">
            Categories
          </Button>
          <Button color="inherit" component={Link} to="/drag-drop">
            Drag & Drop
          </Button>
          <Button color="inherit" component={Link} to="/document-preview">
            Document Preview
          </Button>
          <Button color="inherit" component={Link} to="/question-approval">
            Question Approval
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
