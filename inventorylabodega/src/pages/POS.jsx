import { useState, useEffect } from 'react';
import { 
  Container, Box, Grid, Paper, Typography, TextField, 
  List, ListItem, ListItemText, ListItemButton, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Chip, useMediaQuery, useTheme,
  FormControl, InputLabel, Select, MenuItem, RadioGroup, FormControlLabel, Radio, FormLabel,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Snackbar, Alert, Autocomplete 
} from '@mui/material';
import { 
  AddShoppingCart, Delete, ReceiptLong, History, AssignmentInd, 
  CheckCircle, PersonAdd 
} from '@mui/icons-material';
import { useInventory } from '../context/InventoryContext';
import SalesHistory from '../components/SalesHistory';
import { printTicket, generateTicketHTML } from '../utils/printTicket';
import { markSaleAsPaidService } from '../services/saleService';
import DebtorsModal from '../components/DebtorsModal';
import { getUsersRequest } from '../services/authService';
import { useThemeMode } from '../context/ThemeContext'; 

export default function POS() {
  const { products, addSale, sales } = useInventory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); 
  const { mode } = useThemeMode();

  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0); 
  const [historyOpen, setHistoryOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [vendedoresList, setVendedoresList] = useState([]);
  const [seller, setSeller] = useState('');
  const [debtorsOpen, setDebtorsOpen] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); 
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); 
  const [manualFolio, setManualFolio] = useState('');
  const [customersList, setCustomersList] = useState([
    { id: 1, name: 'PÚBLICO EN GENERAL', address: 'DOMICILIO DESCONOCIDO', location: 'TUXTLA GTZ, CHIAPAS', phone: '' },
  ]);
  const [openNewCustomerDialog, setOpenNewCustomerDialog] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', address: '', location: 'TUXTLA GTZ, CHIAPAS', phone: '' });
 

  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO'); 
  const [amountPaid, setAmountPaid] = useState(''); 

  const today = new Date().toLocaleDateString('es-MX');
  const [customer, setCustomer] = useState({
    name: 'PÚBLICO EN GENERAL', address: 'DOMICILIO CONOCIDO', location: 'TUXTLA GTZ, CHIAPAS', phone: ''
  });

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const lista = await getUsersRequest(); 
        if (lista && lista.length > 0) {
          setVendedoresList(lista);
          setSeller(lista[0].username); 
        } else {
          setVendedoresList([{ id: 0, username: 'ADMINISTRADOR' }]);
          setSeller('ADMINISTRADOR');
        }
      } catch (error) {
        console.error("Error cargando usuarios", error);
        setVendedoresList([{ id: 0, username: 'ADMINISTRADOR' }]);
        setSeller('ADMINISTRADOR');
      }
    };
    fetchSellers();
  }, []);

  const filteredProducts = products.filter(p => {
      const search = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(search);
      const matchBarcode = p.barcode ? p.barcode.toLowerCase().includes(search) : false;
      return matchName || matchBarcode;
  });

  useEffect(() => {
    const newTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cart]);

  useEffect(() => {
    const updatePreview = async () => {
        const tempSaleData = {
            id: '---', 
            items: cart, 
            total: total, 
            paymentMethod: paymentMethod,
            seller: seller,
            date: new Date(),
            ticketNumber: manualFolio
        };
        const html = await generateTicketHTML(tempSaleData, customer);
        setPreviewHtml(html);
    };
    updatePreview();
  }, [cart, total, customer, paymentMethod, seller, manualFolio]); 

  const addToCart = (product) => {
    if (product.stock <= 0) {
      showSnackbar(`❌ Producto sin existencia: ${product.name}`, "error");
      return; 
    }
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        showSnackbar(`⚠️ Solo tienes ${product.stock} en stock de ${product.name}`, "warning");
        return; 
      }
      updateQuantity(product.id, existingItem.quantity + 1);
    } 
    else {
      if (product.stock <= 5) { 
        showSnackbar(`⚠️ Quedan pocos en existencia de ${product.name} (Stock: ${product.stock})`, "warning");
      }
      const pRetail = parseFloat(product.priceRetail);
      const pWholesale = parseFloat(product.priceWholesale);
      const initialPrice = (1 >= product.wholesaleQty) ? pWholesale : pRetail;
      
      setCart([...cart, { 
        ...product, quantity: 1, price: initialPrice, 
        priceRetail: pRetail, priceWholesale: pWholesale, isWholesale: (1 >= product.wholesaleQty)
      }]);
    }
  };

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0 || isNaN(newQty)) return; 

    let limiteAlcanzado = false;
    let nombreProducto = "";
    let stockMaximo = 0;

    const carritoActualizado = cart.map(item => {
      if (item.id === id) {
        let cantidadFinal = newQty;
        
        if (newQty > item.stock) {
          cantidadFinal = item.stock; 
          limiteAlcanzado = true;
          nombreProducto = item.name;
          stockMaximo = item.stock;
        }

        const isWholesale = cantidadFinal >= item.wholesaleQty;
        const currentPrice = isWholesale ? item.priceWholesale : item.priceRetail;
        return { ...item, quantity: cantidadFinal, price: currentPrice, isWholesale: isWholesale };
      }
      return item;
    });

    if (limiteAlcanzado) {
      showSnackbar(`⚠️ Solo tienes ${stockMaximo} disponibles de ${nombreProducto}`, "error");
    }

    setCart(carritoActualizado);
  };

  const updatePrice = (id, newPrice) => {
    const val = parseFloat(newPrice);
    if (isNaN(val) || val < 0) return; 

    setCart(cart.map(item => {
        if (item.id === id) {
            return { ...item, price: val };
        }
        return item;
    }));
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));
  const handleCustomerChange = (e) => setCustomer({ ...customer, [e.target.name]: e.target.value });
  
  const change = (parseFloat(amountPaid) || 0) - total;

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleCheckoutClick = () => { 
    if (cart.length === 0) return;
    if (paymentMethod === 'CREDITO' && (!customer.name || customer.name === 'PÚBLICO EN GENERAL')) {
        showSnackbar("⚠️ Para ventas a CRÉDITO debes seleccionar un cliente real.", "warning");
        return; 
    }
    setOpenConfirmDialog(true);
  };

  const handleFinalConfirmCheckout = async () => {
    const saleData = {
        ...customer, seller, paymentMethod, items: cart,
        total: total, 
        amountPaid: parseFloat(amountPaid) || total, 
        change: change > 0 ? change : 0, 
        date: new Date(),
        ticketNumber: manualFolio 
    };

    const success = await addSale(cart, total, customer, seller, paymentMethod, manualFolio); 
    
    if (success) {
        const saleRecord = { 
            id: manualFolio || "PROCESANDO...", 
            date: new Date(), items: cart, total: total,
            paymentMethod: paymentMethod, seller: seller, ticketNumber: manualFolio
        };
        printTicket(saleRecord, saleData);
        
        setCart([]); setTotal(0); setAmountPaid(''); setManualFolio('');
        setPaymentMethod('EFECTIVO'); 
        setCustomer({ name: 'PÚBLICO EN GENERAL', address: 'DOMICILIO CONOCIDO', location: 'TUXTLA GTZ, CHIAPAS', phone: '' });
        setOpenConfirmDialog(false);
        showSnackbar("✅ Venta registrada correctamente", "success");
    } else {
        setOpenConfirmDialog(false);
        showSnackbar("❌ Error al registrar la venta", "error");
    }
  };

  const handleMarkAsPaid = async (saleId) => {
    try {
        await markSaleAsPaidService(saleId);
        showSnackbar("✅ ¡Deuda cobrada con éxito!", "success");
        setDebtorsOpen(false);
        setTimeout(() => setDebtorsOpen(true), 100);
    } catch (error) {
        showSnackbar("❌ Hubo un error al intentar cobrar la deuda.", "error");
    }
  };

  const handleSaveNewCustomer = () => {
    if (!newCustomerForm.name.trim()) {
      showSnackbar("⚠️ El nombre del cliente es obligatorio", "warning");
      return;
    }
    
    const newCust = { 
      id: Date.now(), 
      name: newCustomerForm.name.toUpperCase(), 
      address: newCustomerForm.address.toUpperCase(), 
      location: newCustomerForm.location.toUpperCase(), 
      phone: newCustomerForm.phone 
    };

    setCustomersList([...customersList, newCust]); 
    setCustomer(newCust);
    setOpenNewCustomerDialog(false); 
    setNewCustomerForm({ name: '', address: '', location: 'TUXTLA GTZ, CHIAPAS', phone: '' }); 
    showSnackbar("✅ Cliente agregado exitosamente", "success");
  };

  const getTableFontSize = (value) => {
    const str = value.toString(); 
    return str.length > 9 ? '10px' : str.length > 7 ? '11px' : '12px';                    
  };

  const headerBgColor = mode === 'dark' ? '#333' : '#eee';
  const tableContainerBgColor = mode === 'dark' ? '#1e1e1e' : '#fafafa';
  const tableBorderColor = mode === 'dark' ? '#444' : '#eee';
  const totalBoxBgColor = mode === 'dark' ? '#1e3a5f' : '#e3f2fd'; 

  return (
    <Container maxWidth={false} disableGutters sx={{ 
      height: isMobile ? 'auto' : 'calc(100vh - 85px)', 
      p: 1.5, display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      
      <Grid container spacing={2} sx={{ height: '100%', width: '100%', m: 0 }}>
        <Grid size={{ xs: 12, md: 2 }} sx={{ height: isMobile ? '500px' : '100%', pl: '0 !important' }}>
          <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" gutterBottom color="primary" fontWeight="bold">1. CATÁLOGO</Typography>
            <TextField placeholder="Buscar..." variant="outlined" size="small" fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ mb: 1 }} />
            <List sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
              {filteredProducts.map((prod) => {
                const isAgotado = prod.stock <= 0;
                const isPoco = prod.stock > 0 && prod.stock <= 15; 
                return (
                  <ListItem key={prod.id} disablePadding divider>
                    <ListItemButton 
                      onClick={() => isAgotado ? showSnackbar(`❌ Producto agotado: ${prod.name}`, "error") : addToCart(prod)} 
                      sx={{ py: 1, px: 1, opacity: isAgotado ? 0.5 : 1, bgcolor: isAgotado ? 'action.hover' : 'inherit', cursor: isAgotado ? 'not-allowed' : 'pointer'}}
                    >
                      <ListItemText 
                        primary={<Typography variant="caption" fontWeight="bold" sx={{ color: isAgotado ? 'text.disabled' : 'text.primary', textDecoration: isAgotado ? 'line-through' : 'none' }}>{prod.name}</Typography>}
                        secondary={<Typography variant="caption" color={isAgotado ? "error.main" : (isPoco ? "warning.main" : "text.secondary")} fontWeight={isPoco || isAgotado ? "bold" : "normal"}>Stock: {prod.stock} | ${prod.priceRetail} {isAgotado && " (AGOTADO)"} {isPoco && " (¡Pocos!)"}</Typography>} 
                      />
                      <AddShoppingCart color={isAgotado ? "disabled" : "primary"} fontSize="small" />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ height: isMobile ? 'auto' : '100%', pt: '0 !important' }}> 
          <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" fontWeight="bold" color="primary">2. CARRITO ({cart.length})</Typography>
              <Button size="small" startIcon={<History />} onClick={() => setHistoryOpen(true)}>Historial</Button>
            </Box>
            
            <TableContainer sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: tableContainerBgColor, border: `1px solid ${tableBorderColor}`, borderRadius: 1, mb: 2 }}>
              <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '30%', py:1, fontWeight:'bold', fontSize:'11px', bgcolor: headerBgColor }}>Producto</TableCell>
                    <TableCell align="center" sx={{ width: '25%', py:1, fontWeight:'bold', fontSize:'11px', bgcolor: headerBgColor }}>Cant.</TableCell>
                    <TableCell align="center" sx={{ width: '25%', py:1, fontWeight:'bold', fontSize:'11px', bgcolor: headerBgColor }}>Precio U.</TableCell>
                    <TableCell align="right" sx={{ width: '20%', py:1, fontWeight:'bold', fontSize:'11px', bgcolor: headerBgColor }}>Total</TableCell>
                    <TableCell sx={{ width: '10%', py:1, bgcolor: headerBgColor }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ py: 0.5 }}> 
                        <Typography variant="caption" fontWeight="bold" sx={{display:'block', lineHeight:1.1}}>{item.name}</Typography>
                        {item.isWholesale && <Chip label="MAYOREO" color="secondary" size="small" sx={{fontSize:9, height:16}} />}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 0.5 }}>
                        <TextField type="number" variant="standard" value={item.quantity === 0 ? '' : item.quantity} onChange={(e) => updateQuantity(item.id, isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value))} inputProps={{ min: "0", step: "any", style: { textAlign: 'center', fontWeight: 'bold' } }} sx={{ width: '50px' }} />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 0.5 }}>
                        <TextField type="number" variant="standard" value={item.price} onChange={(e) => updatePrice(item.id, e.target.value)} inputProps={{ style: { textAlign: 'center', fontSize: '13px', color: '#1976d2' } }} InputProps={{startAdornment: <Typography variant="caption" sx={{mr:0.5}}>$</Typography>}} sx={{ width: '70px' }} />
                      </TableCell>
                      <TableCell align="right" sx={{ py: 0.5, fontWeight:'bold', fontSize: getTableFontSize((item.price * item.quantity).toFixed(2)) }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 0.5 }}>
                        <IconButton color="error" size="small" onClick={() => removeFromCart(item.id)}><Delete fontSize="small" sx={{ fontSize: '16px' }}/></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ p: 2, bgcolor: totalBoxBgColor, borderRadius: 1 }}>
              <Box display="flex" justifyContent="space-between">
                <Box>
                    <Typography variant="body2" fontWeight="bold">TOTAL A PAGAR:</Typography>
                    <Typography variant="caption" color="text.secondary">{cart.length} Artículos</Typography>
                </Box>
                <Typography variant="h5" fontWeight="900" color="primary">${total.toFixed(2)}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }} sx={{ height: isMobile ? 'auto' : '100%', pt: '0 !important' }}>
          <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <Typography variant="subtitle2" gutterBottom color="secondary" fontWeight="bold">3. DATOS TICKET</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Vendedor</InputLabel>
                <Select value={seller} label="Vendedor" onChange={(e) => setSeller(e.target.value)} sx={{fontSize:'12px'}}>
                  {vendedoresList.map((v) => (
                    <MenuItem key={v.id} value={v.username} sx={{fontSize:'12px'}}>{v.username.toUpperCase()}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box display="flex" gap={1} alignItems="center">
                <Autocomplete
                  fullWidth
                  size="small"
                  options={customersList}
                  getOptionLabel={(option) => option.name || ''}
                  value={customersList.find(c => c.name === customer.name) || null}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      setCustomer({
                        name: newValue.name,
                        address: newValue.address || '',
                        location: newValue.location || '',
                        phone: newValue.phone || ''
                      });
                    } else {
                      setCustomer({ name: '', address: '', location: '', phone: '' });
                    }
                  }}
                  freeSolo
                  onInputChange={(event, newInputValue) => {
                      if(event && event.type === 'change'){
                         setCustomer(prev => ({ ...prev, name: newInputValue.toUpperCase() }));
                      }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Buscar o Escribir Cliente" InputProps={{...params.InputProps, style:{fontSize:12}}} />
                  )}
                />
                <IconButton 
                  color="primary" 
                  sx={{ bgcolor: 'action.hover', borderRadius: 1 }}
                  onClick={() => setOpenNewCustomerDialog(true)}
                  title="Agregar Nuevo Cliente"
                >
                  <PersonAdd />
                </IconButton>
              </Box>
              
              <TextField label="Dirección" size="small" value={customer.address} name="address" onChange={handleCustomerChange} multiline rows={2} InputProps={{style:{fontSize:12}}} />
              <Box display="flex" gap={1}>
                <TextField label="Ciudad" size="small" value={customer.location} name="location" onChange={handleCustomerChange} InputProps={{style:{fontSize:12}}} />
                <TextField label="Tel" size="small" value={customer.phone} name="phone" onChange={handleCustomerChange} InputProps={{style:{fontSize:12}}} />
              </Box>
              <Divider />
              
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{fontSize:'11px'}}>Método Pago</FormLabel>
                <RadioGroup row value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <FormControlLabel value="EFECTIVO" control={<Radio size="small"/>} label={<Typography sx={{fontSize:'11px'}}>Efectivo</Typography>} />
                  <FormControlLabel value="TRANSFERENCIA" control={<Radio size="small"/>} label={<Typography sx={{fontSize:'11px'}}>Transf.</Typography>} />
                  <FormControlLabel value="CREDITO" control={<Radio size="small"/>} label={<Typography sx={{fontSize:'11px'}}>Crédito</Typography>} />
                </RadioGroup>
              </FormControl>

              <Button variant="outlined" color="warning" size="small" fullWidth startIcon={<AssignmentInd />} onClick={() => setDebtorsOpen(true)} sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                VER CUENTAS POR COBRAR
              </Button>

              {paymentMethod === 'EFECTIVO' && (
                <Box>
                  <TextField label="Pagan con:" type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} size="small" fullWidth color="success" placeholder="$ 0.00" InputProps={{ sx: { fontSize: 18, fontWeight: 'bold' } }} />
                  {amountPaid && (
                    <Typography variant="caption" sx={{ display:'block', mt:0.5, textAlign:'right', fontWeight:'bold', color: change >= 0 ? 'green' : 'red' }}>
                        Cambio: ${change.toFixed(2)}
                    </Typography>
                  )}
                </Box>
              )}

              <TextField label="Folio Manual (Opcional)" value={manualFolio} onChange={(e) => setManualFolio(e.target.value)} size="small" fullWidth placeholder="Ej. A-1050" InputProps={{ sx: { fontWeight: 'bold', color: '#d32f2f' } }} sx={{ mt: 1 }}/>

            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }} sx={{ height: isMobile ? 'auto' : '100%', pt: '0 !important' }}>
          <Paper elevation={4} sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#424242', color: 'white' }}>
            <Typography variant="subtitle2" gutterBottom sx={{color: '#fff', fontWeight:'bold', display:'flex', alignItems:'center', gap:1}}>
              <ReceiptLong fontSize="small"/> Vista Previa
            </Typography>

            <Box sx={{ flexGrow: 1, bgcolor: '#fff', borderRadius: 1, overflow: 'hidden', mb: 1, display: 'flex', flexDirection: 'column' }}>
               <iframe srcDoc={previewHtml} title="Vista Previa Ticket" style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} />
            </Box>

            <Button variant="contained" color="success" fullWidth size="large" onClick={handleCheckoutClick} disabled={cart.length === 0} sx={{ py: 1.5, fontWeight: 'bold', boxShadow: '0px 0px 15px rgba(102, 187, 106, 0.5)' }}>
              COBRAR ${total.toFixed(2)}
            </Button>
          </Paper>
        </Grid>

      </Grid>
      
      <SalesHistory open={historyOpen} onClose={() => setHistoryOpen(false)} sales={sales} />
      
      <DebtorsModal open={debtorsOpen} onClose={() => setDebtorsOpen(false)} sales={sales} onMarkAsPaid={handleMarkAsPaid} />

      <Dialog open={openNewCustomerDialog} onClose={() => setOpenNewCustomerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', pb: 2 }}>
          Registrar Nuevo Cliente
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField 
                label="Nombre Completo o Empresa" fullWidth size="small" 
                value={newCustomerForm.name} 
                onChange={(e) => setNewCustomerForm({...newCustomerForm, name: e.target.value})} 
              />
            </Grid>
            <Grid size={12}>
              <TextField 
                label="Dirección" fullWidth size="small" multiline rows={2}
                value={newCustomerForm.address} 
                onChange={(e) => setNewCustomerForm({...newCustomerForm, address: e.target.value})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Ciudad/Ubicación" fullWidth size="small" 
                value={newCustomerForm.location} 
                onChange={(e) => setNewCustomerForm({...newCustomerForm, location: e.target.value})} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label="Teléfono" fullWidth size="small" 
                value={newCustomerForm.phone} 
                onChange={(e) => setNewCustomerForm({...newCustomerForm, phone: e.target.value})} 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenNewCustomerDialog(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleSaveNewCustomer} variant="contained" color="primary">Guardar y Seleccionar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#2e7d32' }}>
            <CheckCircle /> Confirmar Venta
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                {paymentMethod === 'CREDITO' ? (
                    <>¿Confirmar venta <b>A CRÉDITO</b> por <b>${total.toFixed(2)}</b>?<br />Cliente: <b>{customer.name}</b></>
                ) : (
                    <>¿Cobrar <b>${total.toFixed(2)}</b> e imprimir ticket?<br />Método: <b>{paymentMethod}</b></>
                )}
            </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenConfirmDialog(false)} color="inherit" variant="outlined">Cancelar</Button>
            <Button onClick={handleFinalConfirmCheckout} variant="contained" color="success" size="large" autoFocus>SÍ, CONFIRMAR</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>

    </Container>
  );
}