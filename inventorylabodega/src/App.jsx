import React from 'react';
import { Box } from '@mui/material'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { MaintenanceProvider } from './context/MaintenanceContext'; 
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Settings from './components/Settings'; 

function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <MaintenanceProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
              <Navbar /> 
              <Box component="main" sx={{ flexGrow: 1, width: '100%', height: '100%', overflow: 'hidden', bgcolor: '#f4f6f8', position: 'relative' }}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
                  <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                  <Route path="/pos" element={<ProtectedRoute><POS/></ProtectedRoute>} />
                  <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
                  <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
                  <Route path="/expenses/store" element={<ProtectedRoute><Expenses type="store" /> </ProtectedRoute>} />
                  <Route path="/expenses/warehouse" element={<ProtectedRoute><Expenses type="warehouse" /></ProtectedRoute>} />
                  <Route path="/expenses/payroll" element={<ProtectedRoute><Expenses type="payroll" /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Box sx={{ height: '100%', overflowY: 'auto' }}><Settings /></Box></ProtectedRoute>} />
                </Routes>
              </Box>
            </Box>
          </Router>
        </MaintenanceProvider>
      </InventoryProvider>
    </AuthProvider>
  );
}

export default App;