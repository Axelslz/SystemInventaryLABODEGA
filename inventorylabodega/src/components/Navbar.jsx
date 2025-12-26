import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sistema Inventario
        </Typography>
        
        <Box>
          <Button color="inherit" component={RouterLink} to="/">
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/inventory">
            Inventario
          </Button>
          <Button color="inherit" component={RouterLink} to="/pos">
            Venta (POS)
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;