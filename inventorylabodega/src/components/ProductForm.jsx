import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Grid, InputAdornment, Typography
} from '@mui/material';

export default function ProductForm({ open, handleClose, onSave, initialData }) {
  
  const defaultState = {
    name: '',
    provider: '', 
    stock: '',
    cost: '', 
    priceRetail: '',
    priceWholesale: '',
    wholesaleQty: ''
  };

  const [formData, setFormData] = useState(defaultState);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultState);
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const costoUnitario = parseFloat(formData.cost) || 0;
  const cantidadPiezas = parseInt(formData.stock) || 0;
  const inversionTotal = (costoUnitario * cantidadPiezas).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    const productToSend = {
      ...formData,
      stock: parseInt(formData.stock) || 0,
      cost: parseFloat(formData.cost) || 0,
      priceRetail: parseFloat(formData.priceRetail) || 0,
      priceWholesale: parseFloat(formData.priceWholesale) || 0,
      wholesaleQty: parseInt(formData.wholesaleQty) || 1,
      provider: formData.provider || '' 
    };
    
    onSave(productToSend);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        {initialData ? 'Editar Producto' : 'Nuevo Producto'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            
            {/* DATOS GENERALES */}
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                label="Nombre del Material"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Proveedor"
                name="provider"
                value={formData.provider || ''}
                onChange={handleChange}
                fullWidth
                placeholder="Ej. Truper"
              />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{fontWeight:'bold'}}>
                    COSTOS E INVENTARIO
                </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Costo Unitario ($)"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleChange}
                fullWidth
                required
                helperText="Costo por pieza"
                inputProps={{ min: 0, step: "0.01" }}
                InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Cantidad Piezas"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                fullWidth
                required
                helperText="Stock inicial"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Inversión Real ($)"
                value={inversionTotal}
                fullWidth
                disabled 
                InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    style: { fontWeight: 'bold', color: 'black', backgroundColor: '#f5f5f5' }
                }}
                helperText="Cálculo automático"
              />
            </Grid>

            <Grid item xs={12} sx={{mt:1}}>
                <Typography variant="caption" color="text.secondary" sx={{fontWeight:'bold'}}>
                    PRECIOS DE VENTA
                </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="P. Menudeo ($)"
                name="priceRetail"
                type="number"
                value={formData.priceRetail}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="P. Mayoreo ($)"
                name="priceWholesale"
                type="number"
                value={formData.priceWholesale}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Mínimo Mayoreo (pzs)"
                name="wholesaleQty"
                type="number"
                value={formData.wholesaleQty}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} color="error">
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
