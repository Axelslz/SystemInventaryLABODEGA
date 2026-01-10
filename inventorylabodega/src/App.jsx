import React from 'react';
import { Box } from '@mui/material'; // Usamos Box en lugar de div
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext'; 
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';

// Páginas
import Login from './pages/Login';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <Router>
          {/* Contenedor Flex para estructura vertical correcta */}
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            
            <Navbar /> 
            
            {/* Main Content: Se adapta al espacio restante */}
            <Box 
              component="main" 
              sx={{ 
                flexGrow: 1, 
                width: '100%',
                overflowX: 'hidden', // Seguridad extra
                p: 0 // Quitamos padding global para que el POS use todo el espacio
              }}
            >
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard/>
                  </ProtectedRoute>
                } />
                
                <Route path="/inventory" element={
                  <ProtectedRoute>
                    <Inventory />
                  </ProtectedRoute>
                } />

                <Route path="/pos" element={
                  <ProtectedRoute>
                    <POS/>
                  </ProtectedRoute>
                } />

              </Routes>
            </Box>
          </Box>
        </Router>
      </InventoryProvider>
    </AuthProvider>
  );
}

export default App;