import { useState, useEffect } from 'react';
import { 
  Container, Box, Grid, Paper, Typography, TextField, 
  List, ListItem, ListItemText, ListItemButton, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Chip, useMediaQuery, useTheme,
  FormControl, InputLabel, Select, MenuItem, RadioGroup, FormControlLabel, Radio, FormLabel
} from '@mui/material';
import { AddShoppingCart, Delete, ReceiptLong, History } from '@mui/icons-material';
import { useInventory } from '../context/InventoryContext';
import { printTicket } from '../utils/printTicket';
import SalesHistory from '../components/SalesHistory';

// Lista de vendedores simulada
const VENDEDORES = [
  'JOSUE SANTIS',
  'MARIA PEREZ',
  'JUAN LOPEZ',
  'ADMINISTRADOR'
];

export default function POS() {
  const { products, addSale, sales } = useInventory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Estados nuevos para el ticket
  const [seller, setSeller] = useState('JOSUE SANTIS');
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO'); // EFECTIVO o TRANSFERENCIA
  const [amountPaid, setAmountPaid] = useState(''); // Monto con el que paga el cliente

  // Fecha actual para la vista previa
  const today = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  // Folio simulado (en un sistema real vendría de la BD)
  const folio = "F10524"; 

  const [customer, setCustomer] = useState({
    name: 'PÚBLICO EN GENERAL',
    address: 'DOMICILIO CONOCIDO',
    location: 'TUXTLA GTZ, CHIAPAS',
    phone: ''
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const newTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cart]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const initialPrice = (1 >= product.wholesaleQty) ? product.priceWholesale : product.priceRetail;
      setCart([...cart, { 
        ...product, quantity: 1, price: initialPrice, isWholesale: (1 >= product.wholesaleQty)
      }]);
    }
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    setCart(cart.map(item => {
      if (item.id === id) {
        const isWholesale = newQty >= item.wholesaleQty;
        const currentPrice = isWholesale ? item.priceWholesale : item.priceRetail;
        return { ...item, quantity: newQty, price: currentPrice, isWholesale: isWholesale };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const handleCustomerChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  // Cálculo del cambio
  const change = (parseFloat(amountPaid) || 0) - total;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const saleData = {
        ...customer,
        seller: seller,
        paymentMethod: paymentMethod,
        cart: cart,
        total: total,
        amountPaid: parseFloat(amountPaid) || total,
        change: change > 0 ? change : 0
    };

    if (window.confirm(`¿Imprimir ticket para ${customer.name}?`)) {
      const saleRecord = addSale(cart, total, customer); 
      // Aquí pasarías saleData a tu función de impresión real
      printTicket(saleRecord, saleData); 
      
      // Resetear
      setCart([]);
      setTotal(0);
      setAmountPaid('');
      setCustomer({
        name: 'PÚBLICO EN GENERAL',
        address: 'DOMICILIO CONOCIDO',
        location: 'TUXTLA GTZ, CHIAPAS',
        phone: ''
      });
    }
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ 
      height: 'calc(100vh - 64px)', 
      p: 1.5,
      bgcolor: '#f4f6f8', 
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      
      <Grid container spacing={2} sx={{ height: '100%', width: '100%', m: 0 }}>
        
        {/* ---------------- COLUMNA 1: CATÁLOGO (2 espacios) ---------------- */}
        <Grid item xs={12} md={2} sx={{ height: '100%', pl: '0 !important' }}>
          <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" gutterBottom color="primary" fontWeight="bold">
              1. Catálogo
            </Typography>
            <TextField 
              placeholder="Buscar..." variant="outlined" size="small" fullWidth 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ mb: 1 }}
            />
            <List sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
              {filteredProducts.map((prod) => (
                <ListItem key={prod.id} disablePadding divider>
                  <ListItemButton onClick={() => addToCart(prod)} sx={{ py: 1, px: 1 }}>
                    <ListItemText 
                      primary={<Typography variant="body2" fontWeight="bold" noWrap>{prod.name}</Typography>}
                      secondary={
                        <Typography variant="caption" display="block" color="text.secondary">
                          Stock: {prod.stock} | <strong style={{color: '#2e7d32'}}>${prod.priceRetail}</strong>
                        </Typography>
                      } 
                    />
                    <AddShoppingCart color="primary" fontSize="small" />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5} sx={{ height: '100%' }}> 
          <Paper elevation={2} sx={{ 
            p: 2, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'space-between' // Esto asegura que el total se vaya al fondo
          }}>
            
            {/* ENCABEZADO DEL CARRITO */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} sx={{ flexShrink: 0 }}>
              <Typography variant="subtitle1" color="primary" fontWeight="bold">2. Carrito ({cart.length})</Typography>
              <Button size="small" startIcon={<History />} onClick={() => setHistoryOpen(true)}>
                Historial
              </Button>
            </Box>
            
            {/* --- AQUÍ ESTÁ EL AJUSTE CLAVE --- */}
            <TableContainer sx={{ 
              // En lugar de dejarlo crecer infinito, le ponemos un límite fijo:
              height: 'calc(100vh - 300px)', // Calcula la altura de la pantalla menos el espacio de arriba/abajo
              maxHeight: '450px',            // O un tope máximo en píxeles (AJUSTA ESTE NÚMERO SI LO QUIERES MÁS CHICO)
              overflowY: 'auto',             // Activa el scroll si pasa esa altura
              bgcolor: '#fafafa', 
              borderRadius: 1, 
              border: '1px solid #eee',
              mb: 2 // Un margen abajo para separarlo del total
            }}>
              <Table stickyHeader size="small" aria-label="tabla carrito">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ pl:1, py:1, fontWeight: 'bold', fontSize:'12px', bgcolor:'#eee' }}>Producto</TableCell>
                    <TableCell align="center" sx={{ p:0, fontWeight: 'bold', fontSize:'12px', bgcolor:'#eee' }}>Cant.</TableCell>
                    <TableCell align="right" sx={{ pr:1, fontWeight: 'bold', fontSize:'12px', bgcolor:'#eee' }}>Total</TableCell>
                    <TableCell align="center" sx={{ p:0, bgcolor:'#eee' }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id} hover>
                      {/* Reduje el padding (pl: 1, py: 0.5) para que las filas sean más delgadas */}
                      <TableCell sx={{ pl:1, py: 0.5 }}> 
                        <Typography variant="body2" fontWeight="bold" sx={{fontSize:'13px', lineHeight: 1.2}}>
                          {item.name}
                        </Typography>
                        {item.isWholesale && 
                          <Chip label="MAYOREO" color="secondary" size="small" sx={{fontSize:9, height:16}} />
                        }
                      </TableCell>
                      <TableCell align="center" sx={{ p:0 }}>
                        <TextField 
                          type="number" 
                          variant="standard" 
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                          inputProps={{ min: 1, style: { textAlign: 'center', fontWeight: 'bold', padding: '2px' } }} 
                          sx={{ width: 40 }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ pr:1, fontWeight: 'bold', fontSize: '13px' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell align="center" sx={{ p:0 }}>
                        <IconButton color="error" size="small" onClick={() => removeFromCart(item.id)}>
                          <Delete fontSize="small" sx={{ fontSize: '18px' }}/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {cart.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.disabled', fontSize:'13px' }}>
                        Carrito vacío
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* TOTAL FIJO ABAJO */}
            <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #90caf9', flexShrink: 0 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" fontWeight="bold" color="text.secondary">TOTAL:</Typography>
                <Typography variant="h4" color="primary" fontWeight="800">
                  ${total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* ---------------- COLUMNA 3: DATOS CLIENTE (2 espacios) ---------------- */}
        <Grid item xs={12} md={2} sx={{ height: '100%' }}>
          <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff', overflowY: 'auto' }}>
            <Typography variant="subtitle1" gutterBottom color="secondary" fontWeight="bold">
              3. Datos Ticket
            </Typography>
            
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 0 }}>
              {/* Vendedor */}
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Vendedor</InputLabel>
                <Select
                  value={seller}
                  label="Vendedor"
                  onChange={(e) => setSeller(e.target.value)}
                  sx={{fontWeight:'bold'}}
                >
                  {VENDEDORES.map((v) => (
                    <MenuItem key={v} value={v}>{v}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider sx={{my:0.5}}/>

              {/* Datos Cliente */}
              <TextField
                label="Nombre Cliente" name="name"
                value={customer.name} onChange={handleCustomerChange}
                size="small" fullWidth variant="outlined"
              />
              <TextField
                label="Dirección" name="address"
                value={customer.address} onChange={handleCustomerChange}
                size="small" fullWidth multiline rows={2} variant="outlined"
              />
              <TextField
                label="Ciudad" name="location"
                value={customer.location} onChange={handleCustomerChange}
                size="small" fullWidth variant="outlined"
              />
              <TextField
                label="Teléfono" name="phone"
                value={customer.phone} onChange={handleCustomerChange}
                size="small" fullWidth variant="outlined"
              />

              <Divider sx={{my:0.5}}/>

              {/* Método de Pago */}
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{fontSize: '0.8rem'}}>Método de Pago</FormLabel>
                <RadioGroup
                  row
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel value="EFECTIVO" control={<Radio size="small"/>} label={<Typography variant="caption">Efectivo</Typography>} />
                  <FormControlLabel value="TRANSFERENCIA" control={<Radio size="small"/>} label={<Typography variant="caption">Transf.</Typography>} />
                </RadioGroup>
              </FormControl>

              {/* Si es Efectivo, mostrar campo para calcular cambio */}
              {paymentMethod === 'EFECTIVO' && (
                 <TextField
                  label="Pago con:" 
                  type="number"
                  value={amountPaid} 
                  onChange={(e) => setAmountPaid(e.target.value)}
                  size="small" 
                  fullWidth 
                  color="success"
                  placeholder="$ 0.00"
                  InputProps={{ sx: { fontSize: 18, fontWeight: 'bold' } }}
                />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* ---------------- COLUMNA 4: VISTA PREVIA (3 espacios) ---------------- */}
        <Grid item xs={12} md={3} sx={{ height: '100%' }}>
          <Paper elevation={4} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#424242', color: 'white' }}>
            <Typography variant="subtitle1" gutterBottom sx={{color: '#fff', fontWeight:'bold', display:'flex', alignItems:'center', gap:1}}>
              <ReceiptLong /> Vista Previa
            </Typography>

            {/* CONTENEDOR TICKET ESTILO TÉRMICO */}
            <Box sx={{ 
              flexGrow: 1, 
              bgcolor: '#fff', 
              color: '#000', 
              fontFamily: '"Courier New", Courier, monospace', 
              p: 2, 
              overflowY: 'auto',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              mb: 2,
              borderRadius: '2px',
              fontSize: '11px',
              lineHeight: 1.2
            }}>
              {/* ENCABEZADO */}
              <Box textAlign="center" mb={1}>
                {/* LOGO SIMULADO */}
                <Box sx={{display:'inline-block', border:'2px solid #000', p:0.5, mb:0.5}}>
                    <Typography variant="body2" fontWeight="900" sx={{fontSize: '16px', letterSpacing:1}}>LA BODEGA</Typography>
                </Box>
                <Typography variant="caption" display="block" sx={{fontSize: '10px', fontWeight:'bold'}}>Materiales para la Construcción y Galvanizados</Typography>
                <Typography variant="caption" display="block" sx={{fontSize: '9px'}}>1A PTE SUR S/N ENTRE 1A Y 2A SUR - COL EL JOBO</Typography>
                <Typography variant="caption" display="block" sx={{fontSize: '9px'}}>================================</Typography>
              </Box>

              {/* DATOS CLIENTE */}
              <Box mb={1} sx={{textTransform: 'uppercase'}}>
                <Typography variant="body2" sx={{fontSize: '11px', fontWeight:'bold'}}>{customer.name}</Typography>
                <Typography variant="caption" display="block" sx={{fontSize: '10px'}}>{customer.address}</Typography>
                <Typography variant="caption" display="block" sx={{fontSize: '10px'}}>{customer.location}</Typography>
                <Box display="flex" justifyContent="flex-end">
                    <Typography variant="caption" sx={{fontSize: '10px'}}>Tel: {customer.phone}</Typography>
                </Box>
              </Box>

              <Typography variant="caption" display="block" align="center" sx={{fontSize: '10px'}}>--------------------------------</Typography>

              {/* INFO VENTA */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                 <Typography variant="body2" fontWeight="bold" sx={{fontSize: '12px'}}>* NOTA DE VENTA *</Typography>
                 <Typography variant="body2" fontWeight="bold" sx={{fontSize: '12px'}}>Folio:{folio}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mt={0.5}>
                 <Typography variant="caption" sx={{fontSize: '10px'}}>{today} {time}</Typography>
              </Box>
              <Typography variant="caption" display="block" sx={{fontSize: '10px'}}>Vendedor: {seller}</Typography>
              
              <Divider sx={{ my: 0.5, borderStyle: 'solid', borderColor: '#000' }} />

              {/* TABLA PRODUCTOS */}
              <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid black' }}>
                    <th align="left" style={{width: '10%'}}>Cant.</th>
                    <th align="left" style={{width: '15%'}}>U.Med</th>
                    <th align="left" style={{width: '40%'}}>Descrip.</th>
                    <th align="right" style={{width: '15%'}}>P.U</th>
                    <th align="right" style={{width: '20%'}}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td valign="top" align="center" style={{fontWeight:'bold'}}>{item.quantity}</td>
                      <td valign="top">PZA</td> {/* U.Med dummy por ahora */}
                      <td valign="top">
                          <div style={{fontWeight:'bold'}}>{item.id}</div>
                          <div>{item.name}</div>
                      </td>
                      <td valign="top" align="right">{item.price.toFixed(2)}</td>
                      <td valign="top" align="right">{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Box mt={2} mb={1} display="flex" justifyContent="flex-end" alignItems="center">
                  <Typography sx={{fontSize: '14px', fontWeight:'bold', mr: 2}}>TOTAL</Typography>
                  <Typography sx={{fontSize: '16px', fontWeight:'900'}}>${total.toFixed(2)}</Typography>
              </Box>

              {/* DESGLOSE PAGO */}
              {paymentMethod === 'EFECTIVO' ? (
                  <Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography sx={{fontSize: '11px'}}>Efectivo</Typography>
                        <Typography sx={{fontSize: '11px'}}>{amountPaid ? parseFloat(amountPaid).toFixed(2) : '0.00'}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography sx={{fontSize: '11px', fontWeight:'bold'}}>Su Cambio</Typography>
                        <Typography sx={{fontSize: '11px', fontWeight:'bold'}}>{change > 0 ? change.toFixed(2) : '0.00'}</Typography>
                    </Box>
                  </Box>
              ) : (
                  <Box display="flex" justifyContent="space-between">
                      <Typography sx={{fontSize: '11px'}}>Transferencia</Typography>
                      <Typography sx={{fontSize: '11px'}}>{total.toFixed(2)}</Typography>
                  </Box>
              )}

              <Box textAlign="center" mt={3} sx={{fontSize: '9px', fontWeight: 'bold'}}>
                 <Typography variant="inherit">** GRACIAS POR SU COMPRA **</Typography>
                 <Typography variant="inherit">SOLICITE SU FACTURA EL MISMO DIA</Typography>
                 <br/>
                 <Typography variant="inherit">- NO SE ACEPTAN DEVOLUCIONES -</Typography>
                 <br/>
                 <Typography variant="inherit">TELS. 961 182 1679 Y 961 690 5168</Typography>
                 <Typography variant="inherit">labodegaeljobo@hotmail.com</Typography>
              </Box>
            </Box>

            <Button 
              variant="contained" color="success" fullWidth size="large" 
              onClick={handleCheckout}
              disabled={cart.length === 0} 
              sx={{ py: 1.5, fontWeight: 'bold', boxShadow: '0px 0px 15px rgba(102, 187, 106, 0.5)' }}
            >
              COBRAR E IMPRIMIR
            </Button>
          </Paper>
        </Grid>

      </Grid>
      
      <SalesHistory open={historyOpen} onClose={() => setHistoryOpen(false)} sales={sales} />
    </Container>
  );
}