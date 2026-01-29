import { useState } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  useTheme, useMediaQuery, Fab 
} from '@mui/material';
import { Edit, Delete, Add, AttachMoney, WarningAmberRounded } from '@mui/icons-material';
import { useInventory } from '../context/InventoryContext';
import ProductForm from '../components/ProductForm';

export default function Inventory() {
  const { products, deleteProduct, addProduct, updateProduct } = useInventory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

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

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete);
      setOpenDeleteDialog(false);
      setProductToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setProductToDelete(null);
  };

  const totalInversionInventario = products.reduce((acc, prod) => {
      const costo = parseFloat(prod.cost) || 0;
      const stock = parseInt(prod.stock) || 0;
      return acc + (costo * stock);
  }, 0);
    
  return (
    <Box sx={{ 
      p: { xs: 2, md: 3 }, 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden' 
    }}> 
      
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        mb={3} 
        gap={2}
        sx={{ flexShrink: 0 }}
      >
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} width="100%">
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" color="primary">
                Inventario
            </Typography>
            
            <Chip 
                icon={<AttachMoney />} 
                label={`Inversión Total: $${totalInversionInventario.toFixed(2)}`} 
                color="success" 
                variant="outlined" 
                sx={{ 
                    fontWeight: 'bold', 
                    fontSize: { xs: '0.9rem', sm: '1.1rem' }, 
                    py: 2.5, px: 1, 
                    backgroundColor: '#e8f5e9',
                    width: { xs: '100%', sm: 'auto' } 
                }}
            />
        </Box>

        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={handleOpenCreate}
          size="large"
          sx={{ 
              fontWeight: 'bold', 
              display: { xs: 'none', sm: 'flex' }, 
              whiteSpace: 'nowrap'
          }}
        >
          Nuevo Producto
        </Button>
      </Box>

      <Paper elevation={3} sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <TableContainer sx={{ flexGrow: 1, maxHeight: '100%', overflowY: 'auto', overflowX: 'auto' }}>
          <Table stickyHeader size={isMobile ? "small" : "medium"}> 
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#eeeeee', fontWeight: 'bold' }}>Material</TableCell>
                <TableCell sx={{ backgroundColor: '#eeeeee', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Proveedor</TableCell>
                <TableCell align="center" sx={{ backgroundColor: '#eeeeee', fontWeight: 'bold' }}>Stock</TableCell>
                <TableCell align="right" sx={{ backgroundColor: '#eeeeee', fontWeight: 'bold' }}>Costo U.</TableCell>
                <TableCell align="right" sx={{ backgroundColor: '#dcedc8', fontWeight: 'bold', color: '#33691e', display: { xs: 'none', sm: 'table-cell' } }}>Inversión</TableCell>
                <TableCell align="right" sx={{ backgroundColor: '#eeeeee', fontWeight: 'bold' }}>P. Menudeo</TableCell>
                <TableCell align="right" sx={{ backgroundColor: '#eeeeee', fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>P. Mayoreo</TableCell>
                <TableCell align="center" sx={{ backgroundColor: '#eeeeee', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    No hay productos registrados
                  </TableCell>
                </TableRow>
              ) : (
                products.map((row) => {
                    const costoU = parseFloat(row.cost) || 0;
                    const stock = parseInt(row.stock) || 0;
                    const totalInv = (costoU * stock).toFixed(2);

                    return (
                        <TableRow key={row.id} hover>
                            <TableCell sx={{ fontWeight:'bold' }}>
                                {row.name}
                                {isMobile && row.provider && (
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        {row.provider}
                                    </Typography>
                                )}
                            </TableCell>
                            
                            <TableCell sx={{ color: 'text.secondary', fontSize:'0.9rem', display: { xs: 'none', md: 'table-cell' } }}>
                                {row.provider || '---'}
                            </TableCell>

                            <TableCell align="center">
                                <Box component="span" sx={{ 
                                    color: stock < 10 ? 'error.main' : 'inherit',
                                    fontWeight: stock < 10 ? 'bold' : 'normal',
                                    bgcolor: stock < 10 ? '#ffebee' : 'transparent',
                                    px: 1, borderRadius: 1,
                                    whiteSpace: 'nowrap'
                                }}>
                                    {stock} pzs
                                </Box>
                            </TableCell>

                            <TableCell align="right">${costoU.toFixed(2)}</TableCell>
                            
                            <TableCell align="right" sx={{ fontWeight:'bold', color: '#33691e', bgcolor:'#f1f8e9', display: { xs: 'none', sm: 'table-cell' } }}>
                                ${totalInv}
                            </TableCell>
                            
                            <TableCell align="right" sx={{ color: '#1976d2' }}>
                                ${row.priceRetail}
                            </TableCell>
                            
                            <TableCell align="right" sx={{ color: '#d32f2f', display: { xs: 'none', sm: 'table-cell' } }}>
                                ${row.priceWholesale}
                            </TableCell>
                            
                            <TableCell align="center">
                                <Box display="flex" justifyContent="center">
                                    <IconButton color="primary" onClick={() => handleOpenEdit(row)} size="small"><Edit fontSize="small"/></IconButton>
                                    <IconButton color="error" onClick={() => handleDeleteClick(row.id)} size="small"><Delete fontSize="small"/></IconButton>
                                </Box>
                            </TableCell>
                        </TableRow>
                    );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Fab 
        color="primary" 
        aria-label="add" 
        onClick={handleOpenCreate}
        sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20, 
            display: { xs: 'flex', sm: 'none' } 
        }}
      >
        <Add />
      </Fab>

      <ProductForm 
        open={openModal} 
        handleClose={() => setOpenModal(false)} 
        onSave={handleSave}
        initialData={editingProduct}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f' }}>
            <WarningAmberRounded /> ¿Eliminar producto?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta acción eliminará el producto permanentemente del inventario. 
            ¿Estás seguro de continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={handleCancelDelete} variant="outlined" color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" autoFocus>
            Sí, eliminar
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}