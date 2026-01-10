import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext'; 
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard';


function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <Router>
          <Navbar /> 
          
          <div className="container" style={{ padding: '20px' }}>
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
          </div>
        </Router>
      </InventoryProvider>
    </AuthProvider>
  );
}

export default App;
