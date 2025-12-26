import { InventoryProvider } from './context/InventoryContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import { CssBaseline, Box } from '@mui/material';

function App() {
  return (
    <InventoryProvider>
      <CssBaseline />
      {/* Box actúa como un contenedor principal */}
      <Box sx={{ flexGrow: 1 }}>
        <Navbar />
        <AppRoutes />
      </Box>
    </InventoryProvider>
  );
}

export default App;
