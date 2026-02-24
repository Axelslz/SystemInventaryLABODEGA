import { useState, useEffect, useMemo } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Grid, InputAdornment, Typography, MenuItem, Box, IconButton, Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

export default function ProductForm({ open, handleClose, onSave, initialData, existingProducts = [] }) {
  
  // 1. Agregamos "unit" al estado por defecto
  const defaultState = {
    name: '',
    provider: 'General', 
    unit: 'Pieza', // NUEVO CAMPO
    stock: '',
    cost: '', 
    priceRetail: '',
    priceWholesale: '',
    wholesaleQty: ''
  };

  const [formData, setFormData] = useState(defaultState);
  const [isCustomProvider, setIsCustomProvider] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultState, ...initialData }); // Aseguramos que tome 'Pieza' si viene sin unidad
      setIsCustomProvider(false); 
    } else {
      setFormData(defaultState);
      setIsCustomProvider(false);
    }
  }, [initialData, open]);

  const uniqueProviders = useMemo(() => {
    const providers = existingProducts.map(p => p.provider).filter(p => p && p.trim() !== '');
    const uniqueSet = new Set(['General', ...providers]);
    return [...uniqueSet].sort();
  }, [existingProducts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProviderChange = (e) => {
    const value = e.target.value;
    if (value === '__NEW__') {
      setIsCustomProvider(true);
      setFormData(prev => ({ ...prev, provider: '' }));
    } else {
      setFormData(prev => ({ ...prev, provider: value }));
    }
  };

  // 2. Usamos parseFloat para soportar decimales (ej. 1.5 Kilos)
  const costoUnitario = parseFloat(formData.cost) || 0;
  const cantidad = parseFloat(formData.stock) || 0; 
  const inversionTotal = (costoUnitario * cantidad).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    const productToSend = {
      ...formData,
      // Convertimos todo con parseFloat para no perder los decimales de los kilos/metros
      stock: parseFloat(formData.stock) || 0,
      cost: parseFloat(formData.cost) || 0,
      priceRetail: parseFloat(formData.priceRetail) || 0,
      priceWholesale: parseFloat(formData.priceWholesale) || 0,
      wholesaleQty: parseFloat(formData.wholesaleQty) || 1,
      provider: formData.provider && formData.provider.trim() !== '' ? formData.provider.trim() : 'General',
      unit: formData.unit || 'Pieza'
    };
    
    onSave(productToSend);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {initialData ? 'Editar Producto' : 'Nuevo Producto'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ pb: 3 }}>
          <Grid container spacing={3}>
            
            {/* --- SECCIÓN 1: DATOS GENERALES --- */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                Datos Generales
              </Typography>
              <Divider sx={{ mt: 0.5, mb: -1 }} />
            </Grid>

            {/* El nombre ahora ocupa todo el ancho para dar espacio abajo */}
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Nombre del Material"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                placeholder="Ej. Cemento Cruz Azul o Clavos 2 pulgadas"
              />
            </Grid>

            {/* Proveedor */}
            <Grid item xs={12} sm={6}>
              {!isCustomProvider ? (
                <TextField
                  select
                  label="Proveedor"
                  name="provider"
                  value={uniqueProviders.includes(formData.provider) ? formData.provider : ''}
                  onChange={handleProviderChange}
                  fullWidth
                >
                  {uniqueProviders.map((prov) => (
                    <MenuItem key={prov} value={prov}>
                      {prov}
                    </MenuItem>
                  ))}
                  <MenuItem value="__NEW__" sx={{ fontStyle: 'italic', color: 'primary.main', fontWeight: 'bold' }}>
                    + Agregar nuevo proveedor...
                  </MenuItem>
                </TextField>
              ) : (
                <Box display="flex" gap={1}>
                  <TextField
                    autoFocus
                    label="Nuevo Proveedor"
                    name="provider"
                    value={formData.provider}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Ej. Truper"
                    required 
                  />
                  <IconButton onClick={() => setIsCustomProvider(false)} color="secondary" title="Volver a la lista">
                    <ArrowBack />
                  </IconButton>
                </Box>
              )}
            </Grid>

            {/* NUEVO CAMPO: Unidad de Medida */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Unidad de Medida"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                fullWidth
                required
              >
                <MenuItem value="Pieza">Pieza (pz)</MenuItem>
                <MenuItem value="Kilo">Kilogramo (kg)</MenuItem>
                <MenuItem value="Metro">Metro (m)</MenuItem>
                <MenuItem value="Litro">Litro (L)</MenuItem>
                <MenuItem value="Caja">Caja</MenuItem>
                <MenuItem value="Bulto">Bulto</MenuItem>
              </TextField>
            </Grid>

            {/* --- SECCIÓN 2: COSTOS E INVENTARIO --- */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                Costos e Inventario
              </Typography>
              <Divider sx={{ mt: 0.5, mb: -1 }} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Costo Unitario"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleChange}
                fullWidth
                required
                helperText={`Costo por ${formData.unit.toLowerCase()}`} // Texto dinámico
                inputProps={{ min: 0, step: "any" }}
                InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Cantidad / Stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                fullWidth
                required
                helperText={`Stock en ${formData.unit.toLowerCase()}s`} // Texto dinámico
                inputProps={{ min: 0, step: "any" }} // step="any" permite decimales
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Inversión Real"
                value={inversionTotal}
                fullWidth
                disabled 
                InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    style: { fontWeight: 'bold', color: 'text.primary', backgroundColor: 'action.hover' }
                }}
                helperText="Automático"
              />
            </Grid>

            {/* --- SECCIÓN 3: PRECIOS DE VENTA --- */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                Precios de Venta
              </Typography>
              <Divider sx={{ mt: 0.5, mb: -1 }} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="P. Menudeo"
                name="priceRetail"
                type="number"
                value={formData.priceRetail}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0, step: "any" }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="P. Mayoreo"
                name="priceWholesale"
                type="number"
                value={formData.priceWholesale}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0, step: "any" }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Mínimo Mayoreo"
                name="wholesaleQty"
                type="number"
                value={formData.wholesaleQty}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0, step: "any" }} // Permite comprar "1.5 kilos" como mayoreo
                helperText={`Cant. mínima (${formData.unit.toLowerCase()}s)`}
              />
            </Grid>

          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
          <Button onClick={handleClose} color="error" variant="outlined">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Guardar Producto
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}