import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton,
  Divider,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  FormLabel,
  Switch,
  Slider
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Save as SaveIcon, 
  PersonAdd as PersonAddIcon,
  Receipt as ReceiptIcon,
  Store as StoreIcon,
  People as PeopleIcon,
  Print as PrintIcon
} from '@mui/icons-material';

import { getSellersRequest, createSellerRequest, deleteSellerRequest } from '../services/sellerService';

const VendedoresTab = () => {
  const [vendedores, setVendedores] = useState([]);
  const [nuevoVendedor, setNuevoVendedor] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const res = await getSellersRequest();
      setVendedores(res.data);
    } catch (error) {
      console.error("Error cargando vendedores", error);
      showToast('Error al cargar la lista de vendedores', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!nuevoVendedor.trim()) return;
    try {
      const res = await createSellerRequest(nuevoVendedor.toUpperCase());
      setVendedores([...vendedores, res.data]);
      setNuevoVendedor('');
      showToast('Vendedor agregado correctamente', 'success');
    } catch (error) {
      console.error("Error creando vendedor", error);
      showToast('No se pudo agregar al vendedor', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este vendedor?')) return;
    try {
      await deleteSellerRequest(id);
      setVendedores(vendedores.filter(v => v.id !== id));
      showToast('Vendedor eliminado', 'success');
    } catch (error) {
      console.error("Error eliminando vendedor", error);
      showToast('Error al eliminar vendedor', 'error');
    }
  };

  const showToast = (message, severity) => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => setToast({ ...toast, open: false });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Gestión de Vendedores</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Agrega aquí a los empleados que aparecerán en la lista "Vendedor" del Punto de Venta.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField 
          label="Nombre del Vendedor" 
          variant="outlined" 
          fullWidth 
          value={nuevoVendedor}
          onChange={(e) => setNuevoVendedor(e.target.value)}
          placeholder="Ej: JUAN LOPEZ"
          size="small"
        />
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />}
          onClick={handleAdd}
          disabled={!nuevoVendedor.trim()}
          sx={{ minWidth: '150px', fontWeight: 'bold' }}
        >
          Agregar
        </Button>
      </Box>

      <Paper variant="outlined">
        {loading ? (
           <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>
        ) : (
          <List>
            {vendedores.map((vendedor, index) => (
              <React.Fragment key={vendedor.id}>
                <ListItem>
                  <ListItemText primary={vendedor.name} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" color="error" onClick={() => handleDelete(vendedor.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < vendedores.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {vendedores.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                No hay vendedores registrados en la base de datos.
              </Box>
            )}
          </List>
        )}
      </Paper>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={handleCloseToast}>
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const TicketTab = () => {
  const [form, setForm] = useState({
      storeName: 'LA BODEGA',
      slogan: 'Materiales y Galvanizados',
      address: '1A PTE SUR S/N - COL EL JOBO, TUXTLA GTZ',
      phone: '961 182 1879',
      email: 'contacto@labodega.com',
      footerMessage: '** GRACIAS POR SU COMPRA **\nNO SE ACEPTAN DEVOLUCIONES'
  });

  const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveConfig = () => {
      alert("Configuración lista para guardar (Falta conectar backend de tienda)");
      console.log(form);
  };

  return (
  <Box sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom sx={{ color: '#1565C0', fontWeight: 'bold' }}>
      Información del Ticket
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
      Esta información aparecerá impresa en los recibos de venta.
    </Typography>

    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField 
          label="Nombre de la Tienda" 
          name="storeName"
          fullWidth variant="outlined"
          value={form.storeName} onChange={handleChange}
          helperText="Aparece en letras grandes al inicio"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField 
          label="Frase o Slogan" 
          name="slogan"
          fullWidth variant="outlined"
          value={form.slogan} onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField 
          label="Dirección Completa" 
          name="address"
          fullWidth multiline rows={2} 
          value={form.address} onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField 
          label="Teléfono / WhatsApp" 
          name="phone"
          fullWidth 
          value={form.phone} onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField 
          label="Correo Electrónico" 
          name="email"
          fullWidth 
          value={form.email} onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField 
          label="Mensaje Final" 
          name="footerMessage"
          fullWidth multiline rows={2}
          value={form.footerMessage} onChange={handleChange}
          helperText="Aparece al final del ticket."
        />
      </Grid>

      <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSaveConfig}
          sx={{ px: 4, borderRadius: 2 }}
        >
          Guardar Configuración
        </Button>
      </Grid>
    </Grid>
  </Box>
  );
};

const PrinterTab = () => {
  const [paperSize, setPaperSize] = useState('80');
  const [autoPrint, setAutoPrint] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [marginLeft, setMarginLeft] = useState(0);

  const handleTestPrint = () => {
    alert("Enviando comando de impresión de prueba...\n\n(Aquí se abriría la ventana del navegador con un ticket de muestra)");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#1565C0', fontWeight: 'bold' }}>
        Configuración de Impresión
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Ajusta el formato del recibo para tu impresora térmica.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <FormControl>
              <FormLabel id="paper-size-label" sx={{ fontWeight: 'bold', mb: 1 }}>Tamaño del Papel</FormLabel>
              <RadioGroup
                aria-labelledby="paper-size-label"
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                name="radio-buttons-group"
              >
                <FormControlLabel 
                  value="80" 
                  control={<Radio />} 
                  label={
                    <Box>
                      <Typography variant="body1">80mm (Estándar)</Typography>
                      <Typography variant="caption" color="text.secondary">Usado en impresoras grandes</Typography>
                    </Box>
                  } 
                  sx={{ mb: 1 }}
                />
                <Divider sx={{ my: 1 }} />
                <FormControlLabel 
                  value="58" 
                  control={<Radio />} 
                  label={
                    <Box>
                      <Typography variant="body1">58mm (Pequeño)</Typography>
                      <Typography variant="caption" color="text.secondary">Usado en impresoras portátiles</Typography>
                    </Box>
                  } 
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: 'text.secondary' }}>
              PREFERENCIAS
            </Typography>
            
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemText 
                  primary="Impresión Automática" 
                  secondary="Abrir diálogo de impresión al finalizar venta" 
                />
                <Switch 
                  edge="end" 
                  checked={autoPrint} 
                  onChange={(e) => setAutoPrint(e.target.checked)} 
                />
              </ListItem>
              
              <Divider component="li" />

              <ListItem disableGutters>
                <ListItemText 
                  primary="Mostrar Logo en Ticket" 
                  secondary="Imprimir el logo en la cabecera" 
                />
                <Switch 
                  edge="end" 
                  checked={showLogo} 
                  onChange={(e) => setShowLogo(e.target.checked)} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ px: 1 }}>
            <Typography id="input-slider" gutterBottom variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Margen Izquierdo (Padding)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Usa esto si tu impresora corta el texto del lado izquierdo.
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  value={marginLeft}
                  onChange={(e, val) => setMarginLeft(val)}
                  aria-labelledby="input-slider"
                  min={0}
                  max={50}
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item>
                <Typography variant="body2" sx={{ fontWeight: 'bold', width: '30px' }}>
                  {marginLeft}px
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ mt: 2 }}>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              startIcon={<PrintIcon />}
              onClick={handleTestPrint}
              color="inherit"
            >
              Prueba de Impresión
            </Button>
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />}
              size="large"
            >
              Guardar Configuración
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

const Settings = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1565C0' }}>
        Configuración del Sistema
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PeopleIcon />} iconPosition="start" label="Vendedores" />
          <Tab icon={<StoreIcon />} iconPosition="start" label="Datos Tienda" />
          <Tab icon={<ReceiptIcon />} iconPosition="start" label="Impresora" />
        </Tabs>
        
        {tabIndex === 0 && <VendedoresTab />}
        {tabIndex === 1 && <TicketTab />}
        {tabIndex === 2 && <PrinterTab />}
      </Paper>
    </Container>
  );
};

export default Settings;