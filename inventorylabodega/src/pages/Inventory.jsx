import { useState } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  useTheme, useMediaQuery, Fab 
} from '@mui/material';
import { Edit, Delete, Add, AttachMoney, WarningAmberRounded } from '@mui/icons-material';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext'; 
import ProductForm from '../components/ProductForm';

export default function Inventory() {
  const { products, deleteProduct, addProduct, updateProduct } = useInventory();
  const { user } = useAuth(); 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const isAdmin = user?.role === 'admin';

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
            
            {isAdmin && (
              <Chip 
                  icon={<AttachMoney />} 
                  label={`Inversión Total: $${totalInversionInventario.toFixed(2)}`} 
                  color="success" 
                  variant="outlined" 
                  sx={{ 
                      fontWeight: 'bold', 
                      fontSize: { xs: '0.9rem', sm: '1.1rem' }, 
                      py: 2.5, px: 1, 
                      width: { xs: '100%', sm: 'auto' } 
                  }}
              />
            )}
        </Box>

        {isAdmin && (
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
        )}
      </Box>

      <Paper elevation={3} sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
        <TableContainer sx={{ flexGrow: 1, maxHeight: '100%', overflowY: 'auto', overflowX: 'auto' }}>
          <Table stickyHeader size={isMobile ? "small" : "medium"}> 
            <TableHead>
              <TableRow>
                {/* Usamos 'action.selected' y 'text.primary' en lugar de hexadecimales */}
                <TableCell sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 'bold' }}>Material</TableCell>
                <TableCell sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Proveedor</TableCell>
                <TableCell align="center" sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 'bold' }}>Stock</TableCell>
                
                {isAdmin && <TableCell align="right" sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 'bold' }}>Costo U.</TableCell>}
                
                {/* Columna especial de Inversión adaptada al tema */}
                {isAdmin && <TableCell align="right" sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.08)', color: 'success.main', fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>Inversión</TableCell>}
                
                <TableCell align="right" sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 'bold' }}>P. Menudeo</TableCell>
                <TableCell align="right" sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>P. Mayoreo</TableCell>
                
                {isAdmin && <TableCell align="center" sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 'bold' }}>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
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
                            <TableCell sx={{ fontWeight:'bold', color: 'text.primary' }}>
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
                                    color: stock < 10 ? 'error.main' : 'text.primary',
                                    fontWeight: stock < 10 ? 'bold' : 'normal',
                                    bgcolor: stock < 10 ? 'rgba(211, 47, 47, 0.1)' : 'transparent',
                                    px: 1, py: 0.5, borderRadius: 1,
                                    whiteSpace: 'nowrap'
                                }}>
                                    {stock} pzs
                                </Box>
                            </TableCell>

                            {isAdmin && <TableCell align="right" sx={{ color: 'text.primary' }}>${costoU.toFixed(2)}</TableCell>}
                            {isAdmin && (
                              <TableCell align="right" sx={{ 
                                  fontWeight:'bold', 
                                  color: 'success.main', 
                                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.05)' : 'rgba(76, 175, 80, 0.04)', 
                                  display: { xs: 'none', sm: 'table-cell' } 
                              }}>
                                  ${totalInv}
                              </TableCell>
                            )}
                            
                            {/* Colores primary.main y error.main se adaptan solos al dark mode */}
                            <TableCell align="right" sx={{ color: 'primary.main', fontWeight: '500' }}>
                                ${row.priceRetail}
                            </TableCell>
                            
                            <TableCell align="right" sx={{ color: 'error.main', fontWeight: '500', display: { xs: 'none', sm: 'table-cell' } }}>
                                ${row.priceWholesale}
                            </TableCell>
                            
                            {isAdmin && (
                              <TableCell align="center">
                                  <Box display="flex" justifyContent="center">
                                      <IconButton color="primary" onClick={() => handleOpenEdit(row)} size="small"><Edit fontSize="small"/></IconButton>
                                      <IconButton color="error" onClick={() => handleDeleteClick(row.id)} size="small"><Delete fontSize="small"/></IconButton>
                                  </Box>
                              </TableCell>
                            )}
                        </TableRow>
                    );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {isAdmin && (
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
      )}

      <ProductForm 
        open={openModal} 
        handleClose={() => setOpenModal(false)} 
        onSave={handleSave}
        initialData={editingProduct}
      />

      <Dialog open={openDeleteDialog} onClose={handleCancelDelete}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <WarningAmberRounded /> ¿Eliminar producto?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary' }}>
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