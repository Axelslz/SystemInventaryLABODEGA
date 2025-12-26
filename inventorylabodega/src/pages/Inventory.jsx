import { useState } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, // <--- Quitamos Container, dejamos Box
  TableContainer, TableHead, TableRow, Paper, IconButton 
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useInventory } from '../context/InventoryContext';
import ProductForm from '../components/ProductForm';

export default function Inventory() {
  const { products, deleteProduct, addProduct, updateProduct } = useInventory();
  
  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleOpenCreate = () => {
    setEditingProduct(null); 
    setOpenModal(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setOpenModal(true);
  };

  const handleSave = (productData) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
  };

  const handleDelete = (id) => {
    if(window.confirm('¿Seguro que quieres eliminar este producto?')) {
      deleteProduct(id);
    }
  };

  return (
    // CAMBIO IMPORTANTE: Usamos Box con width 100% en lugar de Container
    <Box sx={{ p: 3, width: '100%' }}> 
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestión de Inventario</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={handleOpenCreate}
        >
          Nuevo Producto
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><b>Material</b></TableCell>
              <TableCell align="right"><b>Stock</b></TableCell>
              <TableCell align="right"><b>Costo</b></TableCell>
              <TableCell align="right"><b>P. Menudeo</b></TableCell>
              <TableCell align="right"><b>P. Mayoreo</b></TableCell>
              <TableCell align="center"><b>Min. Mayoreo</b></TableCell>
              <TableCell align="center"><b>Acciones</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No hay productos registrados</TableCell>
              </TableRow>
            ) : (
              products.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">{row.stock}</TableCell>
                  <TableCell align="right">${row.cost}</TableCell>
                  
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    ${row.priceRetail}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#dc004e' }}>
                    ${row.priceWholesale}
                  </TableCell>
                  
                  <TableCell align="center">{row.wholesaleQty} pzs</TableCell>

                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleOpenEdit(row)}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(row.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ProductForm 
        open={openModal} 
        handleClose={() => setOpenModal(false)} 
        onSave={handleSave}
        initialData={editingProduct}
      />
    </Box>
  );
}