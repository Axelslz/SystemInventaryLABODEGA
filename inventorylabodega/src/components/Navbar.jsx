import React from 'react';
import { AppBar, Toolbar, Button, Box, Container, IconButton, Avatar, Tooltip, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  Dashboard as DashboardIcon, 
  Inventory as InventoryIcon, 
  PointOfSale as PointOfSaleIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

import logoImg from '../assets/logo.png'; 

const Navbar = () => {
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Inventario', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Punto de Venta', icon: <PointOfSaleIcon />, path: '/pos' },
  ];

  return (
    <AppBar 
      position="static" 
      elevation={4} 
      sx={{ 
        background: 'linear-gradient(90deg, #1565C0 0%, #0D47A1 100%)',
        color: 'white',
        overflow: 'visible',
        zIndex: 1200 
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '50px', position: 'relative' }}> 
          
          <Box 
            component={RouterLink} 
            to="/"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              position: 'relative', 
              width: '140px', 
              height: '50px', 
              mr: 2,
            }}
          >
            <Box
              component="img"
              src={logoImg}
              alt="Logo La Bodega"
              sx={{
                position: 'absolute',
                height: '130px', 
                width: 'auto',
                top: -35, 
                left: -40,
                filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.4))',
                zIndex: 1300, 
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)' 
                }
              }}
            />
          </Box>

          {/* --- MENÚ DE NAVEGACIÓN --- */}
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.text}
                  component={RouterLink}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    my: 2,
                    color: 'white',
                    display: 'flex',
                    textTransform: 'none',
                    fontWeight: isActive ? 'bold' : 'normal',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    borderRadius: '8px',
                    px: 2,
                    borderBottom: isActive ? '3px solid #64b5f6' : '3px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {item.text}
                </Button>
              );
            })}
          </Box>

          {/* --- ZONA DE USUARIO --- */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notificaciones">
              <IconButton sx={{ color: 'white' }}>
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            
            <Box sx={{ textAlign: 'right', mr: 1, display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1 }}>
                Admin
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Gerente
              </Typography>
            </Box>

            <Tooltip title="Perfil">
              <IconButton sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: '#ff9800', color: '#fff' }}>A</Avatar>
              </IconButton>
            </Tooltip>
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;