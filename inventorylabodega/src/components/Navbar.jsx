import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Button, Box, Container, IconButton, Avatar, 
  Tooltip, Typography, Menu, MenuItem, Divider, ListItemIcon,
  Drawer, List, ListItem, ListItemButton, ListItemText, Collapse, useTheme, useMediaQuery
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  Dashboard as DashboardIcon, 
  Inventory as InventoryIcon, 
  PointOfSale as PointOfSaleIcon,
  Logout as LogoutIcon,
  Badge as BadgeIcon,
  Build as BuildIcon,       
  ReceiptLong as ReceiptIcon,
  Store as StoreIcon,           
  Warehouse as WarehouseIcon,  
  ArrowDropDown as ArrowDropDownIcon,
  Groups as GroupsIcon,
  Menu as MenuIcon,       
  Close as CloseIcon,     
  ExpandLess,             
  ExpandMore,
  Brightness4, // <-- Icono Luna
  Brightness7  // <-- Icono Sol
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext'; // <-- Importamos nuestro contexto
import logoImg from '../assets/logo.png'; 

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth(); 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); 
  
  // Extraemos el modo y la función para cambiarlo
  const { mode, toggleTheme } = useThemeMode();

  // --- 1. DECLARAMOS TODOS LOS HOOKS PRIMERO (ANTES DE CUALQUIER RETURN) ---
  const [anchorEl, setAnchorEl] = useState(null);
  const [expensesAnchorEl, setExpensesAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGastosOpen, setMobileGastosOpen] = useState(false);

  // Variables derivadas
  const openUserMenu = Boolean(anchorEl);
  const openExpensesDesktop = Boolean(expensesAnchorEl);
  const isExpensesActive = location.pathname.includes('/expenses');

  // Handlers
  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorEl(null);
  const handleLogout = () => { handleCloseUserMenu(); logout(); };
  const handleExpensesClick = (event) => setExpensesAnchorEl(event.currentTarget);
  const handleExpensesClose = () => setExpensesAnchorEl(null);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMobileGastosToggle = () => setMobileGastosOpen(!mobileGastosOpen);

  const allMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['admin'] },   
    { text: 'Inventario', icon: <InventoryIcon />, path: '/inventory', roles: ['admin', 'empleado'] }, 
    { text: 'Punto de Venta', icon: <PointOfSaleIcon />, path: '/pos', roles: ['admin', 'empleado'] }, 
    { text: 'Mantenimiento', icon: <BuildIcon />, path: '/maintenance', roles: ['admin'] }, 
    { text: 'Gastos', icon: <ReceiptIcon />, path: null, isDropdown: true, roles: ['admin'] }, 
  ];
  const userRole = user?.role || 'empleado';
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  if (!user) return null;

  const drawerContent = (
    <Box sx={{ width: 280, height: '100%', bgcolor: mode === 'dark' ? '#1e1e1e' : '#f5f5f5', color: mode === 'dark' ? '#fff' : 'inherit' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#1565C0', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">MENÚ</Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      
      <List>
        {menuItems.map((item) => {
          if (item.isDropdown) {
            return (
              <React.Fragment key={item.text}>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleMobileGastosToggle}>
                    <ListItemIcon sx={{ color: isExpensesActive ? '#1565C0' : 'inherit' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isExpensesActive ? 'bold' : 'medium' }} />
                    {mobileGastosOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={mobileGastosOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ bgcolor: mode === 'dark' ? '#333' : '#e3f2fd' }}>
                      <ListItemButton component={RouterLink} to="/expenses/store" onClick={handleDrawerToggle} sx={{ pl: 4 }}>
                        <ListItemIcon><StoreIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Gastos de Tienda" />
                      </ListItemButton>
                      <ListItemButton component={RouterLink} to="/expenses/warehouse" onClick={handleDrawerToggle} sx={{ pl: 4 }}>
                        <ListItemIcon><WarehouseIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Gastos de Bodega" />
                      </ListItemButton>
                      <ListItemButton component={RouterLink} to="/expenses/payroll" onClick={handleDrawerToggle} sx={{ pl: 4 }}>
                        <ListItemIcon><GroupsIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Nómina" />
                      </ListItemButton>
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }

          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                component={RouterLink} 
                to={item.path} 
                onClick={handleDrawerToggle}
                selected={isActive}
                sx={{ 
                  '&.Mui-selected': { bgcolor: mode === 'dark' ? 'rgba(21, 101, 192, 0.3)' : 'rgba(21, 101, 192, 0.12)', borderRight: '4px solid #1565C0' } 
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#1565C0' : 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 'bold' : 'medium' }} />
              </ListItemButton>
            </ListItem>
          );
        })}
        
        <Divider sx={{ my: 1 }} />
        
        {/* --- OPCIÓN DE MODO OSCURO EN MENÚ HAMBURGUESA --- */}
        <ListItem disablePadding>
          <ListItemButton onClick={toggleTheme}>
            <ListItemIcon sx={{ color: mode === 'dark' ? '#ffd54f' : 'inherit' }}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </ListItemIcon>
            <ListItemText primary={mode === 'dark' ? 'Modo Claro' : 'Modo Oscuro'} />
          </ListItemButton>
        </ListItem>

      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={4} 
        sx={{ 
          background: mode === 'dark' ? '#121212' : 'linear-gradient(90deg, #1565C0 0%, #0D47A1 100%)',
          color: 'white',
          top: 0, left: 0, right: 0, width: '100%', 
          zIndex: 1200,
          borderBottom: mode === 'dark' ? '1px solid #333' : 'none'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: '60px' }}> 
            
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }} 
            >
              <MenuIcon />
            </IconButton>

            <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', position: 'relative', width: { xs: '100px', md: '140px' }, height: '50px', mr: 2 }}>
              <Box 
                component="img" 
                src={logoImg} 
                alt="Logo" 
                sx={{ 
                  position: 'absolute', 
                  height: { xs: '90px', md: '130px' }, 
                  width: 'auto', 
                  top: { xs: -20, md: -35 }, 
                  left: { xs: -10, md: -40 }, 
                  filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.4))', 
                  zIndex: 1300, 
                  transition: 'transform 0.3s ease', 
                  '&:hover': { transform: 'scale(1.05)' } 
                }} 
              />
            </Box>
            
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {menuItems.map((item) => {
                
                if (item.isDropdown) {
                  return (
                    <Box key={item.text}>
                      <Button
                        onClick={handleExpensesClick}
                        startIcon={item.icon}
                        endIcon={<ArrowDropDownIcon />} 
                        sx={{
                          my: 2, color: 'white', display: 'flex', textTransform: 'none',
                          fontWeight: isExpensesActive ? 'bold' : 'normal',
                          backgroundColor: isExpensesActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                          borderRadius: '8px', px: 2,
                          borderBottom: isExpensesActive ? '3px solid #64b5f6' : '3px solid transparent',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)', transform: 'translateY(-2px)' }
                        }}
                      >
                        {item.text}
                      </Button>
                      <Menu
                        anchorEl={expensesAnchorEl}
                        open={openExpensesDesktop}
                        onClose={handleExpensesClose}
                        onClick={handleExpensesClose}
                        PaperProps={{ elevation: 3, sx: { mt: 1, minWidth: 180 } }}
                      >
                        <MenuItem component={RouterLink} to="/expenses/store">
                          <ListItemIcon><StoreIcon fontSize="small" /></ListItemIcon> Gastos de Tienda
                        </MenuItem>
                        <MenuItem component={RouterLink} to="/expenses/warehouse">
                          <ListItemIcon><WarehouseIcon fontSize="small" /></ListItemIcon> Gastos de Bodega
                        </MenuItem>
                        <Divider />
                        <MenuItem component={RouterLink} to="/expenses/payroll">
                          <ListItemIcon><GroupsIcon fontSize="small" /></ListItemIcon> Nómina
                        </MenuItem>
                      </Menu>
                    </Box>
                  );
                }

                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      my: 2, color: 'white', display: 'flex', textTransform: 'none',
                      fontWeight: isActive ? 'bold' : 'normal',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                      borderRadius: '8px', px: 2,
                      borderBottom: isActive ? '3px solid #64b5f6' : '3px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)', transform: 'translateY(-2px)' }
                    }}
                  >
                    {item.text}
                  </Button>
                );
              })}
            </Box>

            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
              
              {/* --- BOTÓN MODO OSCURO (SOLO EN PC) --- */}
              <IconButton 
                onClick={toggleTheme} 
                color="inherit" 
                sx={{ mr: 1, display: { xs: 'none', md: 'flex' } }}
              >
                {mode === 'dark' ? <Brightness7 sx={{ color: '#ffd54f' }} /> : <Brightness4 />}
              </IconButton>

              <Box sx={{ textAlign: 'right', mr: 1, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1, textTransform: 'uppercase' }}>{user?.username || 'Admin'}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{user?.role || 'Gerente'}</Typography>
              </Box>
              <Tooltip title="Ver Perfil">
                <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: '#ff9800', color: '#fff' }}>{user?.username ? user.username.charAt(0).toUpperCase() : 'A'}</Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl} open={openUserMenu} onClose={handleCloseUserMenu} onClick={handleCloseUserMenu}
                PaperProps={{ elevation: 0, sx: { overflow: 'visible', filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))', mt: 1.5, minWidth: 200, '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1 }, '&:before': { content: '""', display: 'block', position: 'absolute', top: 0, right: 14, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0 } } }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                 <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>{user?.username?.toUpperCase() || 'USUARIO'}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>Rol: {user?.role?.toUpperCase() || 'N/A'}</Typography>
                </Box>
                <Divider />
                <MenuItem component={RouterLink} to="/settings" onClick={handleCloseUserMenu}>
                  <ListItemIcon><BadgeIcon fontSize="small" /></ListItemIcon> Configuración
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon> Cerrar Sesión
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} 
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, bgcolor: mode === 'dark' ? '#1e1e1e' : '#fff' },
        }}
      >
        {drawerContent}
      </Drawer>

      <Toolbar sx={{ minHeight: '60px' }} /> 
    </>
  );
};

export default Navbar;