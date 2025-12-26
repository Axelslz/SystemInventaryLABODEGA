import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Grid 
} from '@mui/material';

export default function ProductForm({ open, handleClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    stock: '',
    cost: '',
    priceRetail: '',    
    priceWholesale: '', 
    wholesaleQty: ''    
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Si no hay datos, limpiamos el formulario
      setFormData({ name: '', stock: '', price: '', cost: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      stock: Number(formData.stock),
      cost: Number(formData.cost),
      priceRetail: Number(formData.priceRetail),
      priceWholesale: Number(formData.priceWholesale),
      wholesaleQty: Number(formData.wholesaleQty)
    });
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth> 
      {/* Cambié maxWidth a 'md' para que quepan mejor los inputs */}
      <DialogTitle>{initialData ? 'Editar Material' : 'Nuevo Material'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nombre del Material / Producto"
                name="name"
                fullWidth required
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            
            {/* Primera fila: Stock y Costo */}
            <Grid item xs={6}>
              <TextField
                label="Stock Disponible"
                name="stock" type="number" fullWidth required
                value={formData.stock}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Costo Inversión (Unitario)"
                name="cost" type="number" fullWidth required
                value={formData.cost}
                onChange={handleChange}
                helperText="Costo real de compra al proveedor"
              />
            </Grid>

            {/* Segunda fila: Precios de Venta */}
            <Grid item xs={4}>
              <TextField
                label="Precio Menudeo"
                name="priceRetail" type="number" fullWidth required
                value={formData.priceRetail}
                onChange={handleChange}
                color="primary" focused
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Precio Mayoreo"
                name="priceWholesale" type="number" fullWidth required
                value={formData.priceWholesale}
                onChange={handleChange}
                color="secondary" focused
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Cant. para Mayoreo"
                name="wholesaleQty" type="number" fullWidth required
                value={formData.wholesaleQty}
                onChange={handleChange}
                helperText="Mínimo de piezas para precio mayoreo"
              />
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}