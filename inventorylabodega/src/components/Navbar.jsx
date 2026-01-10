import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Box, 
  Container, 
  IconButton, 
  Avatar, 
  Tooltip, 
  Typography,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  Dashboard as DashboardIcon, 
  Inventory as InventoryIcon, 
  PointOfSale as PointOfSaleIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png'; 

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth(); 

  if (!user) return null;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

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

          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
            
            {/* <Tooltip title="Notificaciones">
              <IconButton sx={{ color: 'white' }}>
                <NotificationsIcon />
              </IconButton>
            </Tooltip> */}
            
            <Box sx={{ textAlign: 'right', mr: 1, display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1, textTransform: 'uppercase' }}>
                {user?.username || 'Admin'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
                {user?.role || 'Gerente'}
              </Typography>
            </Box>

            <Tooltip title="Ver Perfil">
              <IconButton 
                onClick={handleProfileClick} 
                sx={{ p: 0 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar sx={{ bgcolor: '#ff9800', color: '#fff' }}>
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  minWidth: 200,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                  {user?.username?.toUpperCase() || 'USUARIO'}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  Rol: {user?.role?.toUpperCase() || 'N/A'}
                </Typography>
                <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 0.5 }}>
                  ID Empleado: {user?.id || '---'}
                </Typography>
              </Box>

              <Divider />

              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Mi Cuenta
              </MenuItem>
              
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <BadgeIcon fontSize="small" />
                </ListItemIcon>
                Configuración
              </MenuItem>

              <Divider />

              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                Cerrar Sesión
              </MenuItem>
            </Menu>

          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;