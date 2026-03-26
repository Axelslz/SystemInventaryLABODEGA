import { useState } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  useTheme, useMediaQuery, Fab, TextField, InputAdornment, CircularProgress 
} from '@mui/material';
import { Edit, Delete, Add, AttachMoney, WarningAmberRounded, AddBox, Search, History } from '@mui/icons-material';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext'; 
import ProductForm from '../components/ProductForm';
import { getProductHistoryService } from '../services/productService'; 

export default function Inventory() {
  const { products, deleteProduct, addProduct, updateProduct, addStockToProduct } = useInventory();
  const { user } = useAuth(); 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isAdmin = user?.role === 'admin';
  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [openStockModal, setOpenStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [newStockData, setNewStockData] = useState({ addedStock: '', newCost: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [historyProduct, setHistoryProduct] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  const handleOpenStock = (product) => {
    setStockProduct(product);
    setNewStockData({ addedStock: '', newCost: product.cost || 0 }); 
    setOpenStockModal(true);
  };

  const handleSaveStock = () => {
    if (stockProduct && Number(newStockData.addedStock) > 0) {
      if (addStockToProduct) {
        addStockToProduct(stockProduct.id, newStockData); 
      } else {
        console.warn("Recuerda agregar la función addStockToProduct en tu InventoryContext");
      }
      setOpenStockModal(false);
      setStockProduct(null);
    }
  };

  const handleCancelStock = () => {
    setOpenStockModal(false);
    setStockProduct(null);
  };

  const handleOpenHistory = async (product) => {
    setHistoryProduct(product);
    setOpenHistoryModal(true);
    setLoadingHistory(true);
    try {
      const logs = await getProductHistoryService(product.id);
      setHistoryLogs(logs);
    } catch (error) {
      console.error("Error al obtener el historial", error);
      setHistoryLogs([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseHistory = () => {
    setOpenHistoryModal(false);
    setHistoryProduct(null);
    setHistoryLogs([]);
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchLower)) ||
      (product.provider && product.provider.toLowerCase().includes(searchLower))
    );
  });

  const totalInversionInventario = products.reduce((acc, prod) => {
      const costo = parseFloat(prod.cost) || 0;
      const stock = parseInt(prod.stock) || 0;
      return acc + (costo * stock);
  }, 0);

  const formatHistoryDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute:'2-digit' 
    });
  };
    
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
        <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} alignItems={{ xs: 'flex-start', lg: 'center' }} gap={2} width="100%">
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" color="primary">
                Inventario
            </Typography>
            
            <TextField
              variant="outlined"
              size="small"
              placeholder="Buscar por nombre, código o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: { xs: '100%', sm: '350px' }, bgcolor: 'background.paper', borderRadius: 1 }}
            />

            {isAdmin && (
              <Chip 
                  icon={<AttachMoney />} 
                  label={`Inversión Total: $${totalInversionInventario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                  color="success" 
                  variant="outlined" 
                  sx={{ 
                      fontWeight: 'bold', 
                      fontSize: { xs: '0.9rem', sm: '1rem' }, 
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
                <TableCell sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 'bold' }}>Material</TableCell>
                <TableCell sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Proveedor</TableCell>
                <TableCell align="center" sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 'bold' }}>Stock</TableCell>
                
                {isAdmin && <TableCell align="right" sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 'bold' }}>Costo U.</TableCell>}
                
                {isAdmin && <TableCell align="right" sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.08)', color: 'success.main', fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>Inversión</TableCell>}
                
                <TableCell align="right" sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 'bold' }}>P. Menudeo</TableCell>
                <TableCell align="right" sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>P. Mayoreo</TableCell>
                
                {isAdmin && <TableCell align="center" sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 'bold' }}>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    {searchTerm ? `No se encontraron resultados para "${searchTerm}"` : 'No hay productos registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((row) => {
                    const costoU = parseFloat(row.cost) || 0;
                    const stock = parseInt(row.stock) || 0;
                    const totalInv = (costoU * stock).toFixed(2);

                    return (
                        <TableRow key={row.id} hover>
                            <TableCell sx={{ fontWeight:'bold', color: 'text.primary' }}>
                                {row.name}
                                {row.barcode && (
                                        <Typography variant="caption" display="block" color="primary.main" sx={{ mt: 0.5, fontWeight: 'bold' }}>
                                            CÓDIGO: {row.barcode}
                                        </Typography>
                                    )}
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
                            
                            <TableCell align="right" sx={{ color: 'primary.main', fontWeight: '500' }}>
                                ${row.priceRetail}
                            </TableCell>
                            
                            <TableCell align="right" sx={{ color: 'error.main', fontWeight: '500', display: { xs: 'none', sm: 'table-cell' } }}>
                                ${row.priceWholesale}
                            </TableCell>
                            
                            {isAdmin && (
                              <TableCell align="center">
                                  <Box display="flex" justifyContent="center">
                                      <IconButton color="success" onClick={() => handleOpenStock(row)} size="small" title="Ingresar Stock">
                                          <AddBox fontSize="small"/>
                                      </IconButton>

                                      <IconButton color="info" onClick={() => handleOpenHistory(row)} size="small" title="Ver Historial">
                                          <History fontSize="small"/>
                                      </IconButton>
                                      
                                      <IconButton color="primary" onClick={() => handleOpenEdit(row)} size="small" title="Editar Producto">
                                          <Edit fontSize="small"/>
                                      </IconButton>
                                      
                                      <IconButton color="error" onClick={() => handleDeleteClick(row.id)} size="small" title="Eliminar Producto">
                                          <Delete fontSize="small"/>
                                      </IconButton>
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
        existingProducts={products}
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

      <Dialog open={openStockModal} onClose={handleCancelStock} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Ingresar Stock
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            Producto: <strong>{stockProduct?.name}</strong><br/>
            Stock actual: <strong>{stockProduct?.stock} pzs</strong><br/>
            Costo actual: <strong>${stockProduct?.cost}</strong>
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Cantidad nueva a ingresar"
            type="number"
            fullWidth
            variant="outlined"
            value={newStockData.addedStock}
            onChange={(e) => setNewStockData({ ...newStockData, addedStock: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Costo unitario de compra ($)"
            type="number"
            fullWidth
            variant="outlined"
            value={newStockData.newCost}
            onChange={(e) => setNewStockData({ ...newStockData, newCost: e.target.value })}
            helperText="Se usará para promediar el costo de todo el stock."
          />
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={handleCancelStock} variant="outlined" color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveStock} 
            variant="contained" 
            color="success"
            disabled={!newStockData.addedStock || Number(newStockData.addedStock) <= 0}
          >
            Ingresar y Promediar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openHistoryModal} onClose={handleCloseHistory} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: 'info.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <History /> Bitácora de Movimientos
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="h6" fontWeight="bold">
              {historyProduct?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Código: {historyProduct?.barcode || 'S/N'}
            </Typography>
          </Box>
          
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Acción</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Stock (Ant → Nvo)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Costo (Ant → Nvo)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Precio (Ant → Nvo)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Detalle</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingHistory ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={30} sx={{ mb: 1 }} /><br/>
                      Cargando historial...
                    </TableCell>
                  </TableRow>
                ) : historyLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay registros en la bitácora para este producto.
                    </TableCell>
                  </TableRow>
                ) : (
                  historyLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatHistoryDate(log.createdAt)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={log.action} 
                          size="small" 
                          color={log.action === 'CREACIÓN' ? 'success' : log.action === 'INGRESO DE STOCK' ? 'primary' : 'warning'} 
                          sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{log.oldStock} → <Box component="span" fontWeight="bold" color="primary.main">{log.newStock}</Box></Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">${log.oldCost} → <Box component="span" fontWeight="bold">${log.newCost}</Box></Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">${log.oldPrice} → <Box component="span" fontWeight="bold">${log.newPrice}</Box></Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{log.notes}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={handleCloseHistory} variant="contained" color="info">
            Cerrar Bitácora
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}