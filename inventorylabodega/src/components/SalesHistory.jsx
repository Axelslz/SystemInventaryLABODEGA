import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, 
  TableHead, TableRow, Button, IconButton, Box, Typography, DialogActions,
  TextField 
} from '@mui/material';
import { Visibility, Print } from '@mui/icons-material'; 
import { generateTicketHTML } from '../utils/printTicket'; 

export default function SalesHistory({ open, onClose, sales }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [ticketHTML, setTicketHTML] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenPreview = async (sale) => {
    setIsPreviewOpen(true);
    setTicketHTML('');

    const itemsList = sale.SaleItems || sale.items || sale.cart || [];
    
    const saleData = {
      id: sale.id,
      ticketNumber: sale.ticketNumber,
      date: sale.createdAt || sale.date,
      paymentMethod: sale.paymentMethod,
      seller: sale.seller,
      total: sale.total,
      items: itemsList.map(item => ({
        name: item.productName || item.name,
        quantity: item.quantity,
        price: item.price,
        isWholesale: false 
      }))
    };

    const customerInfo = {
      name: sale.customerName,
      address: sale.customerAddress,
      phone: sale.customerPhone
    };

    try {
      const html = await generateTicketHTML(saleData, customerInfo);
      setTicketHTML(html);
    } catch (error) {
      console.error("Error al generar la vista previa del ticket:", error);
      setTicketHTML('<div style="padding: 20px; text-align: center;">Error al generar el ticket.</div>');
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setTicketHTML('');
  };

  const handlePrintTicket = () => {
    if (!ticketHTML) return;
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (printWindow) {
      printWindow.document.write(ticketHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const filteredSales = sales?.filter((sale) => {
    const folio = sale.ticketNumber ? sale.ticketNumber.toString().toLowerCase() : `f-${sale.id}`.toLowerCase();
    const customerName = (sale.customerName || 'PÚBLICO EN GENERAL').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return folio.includes(searchLower) || customerName.includes(searchLower);
  }) || [];

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Historial de Ventas</DialogTitle>
        
        <Box px={3} pb={2}>
          <TextField
            fullWidth
            size="small"
            label="Buscar por folio o cliente..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        <DialogContent dividers>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Folio</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Productos</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(!sales || sales.length === 0) ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>Cargando o sin ventas...</TableCell></TableRow>
              ) : filteredSales.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>No se encontraron coincidencias</TableCell></TableRow>
              ) : (
                filteredSales.map((sale) => {
                  const itemsList = sale.SaleItems || sale.items || sale.cart || [];
                  const folioAMostrar = sale.ticketNumber ? sale.ticketNumber : `F-${sale.id}`;
                  
                  return (
                    <TableRow key={sale.id} hover>
                      <TableCell>#{folioAMostrar}</TableCell>
                      <TableCell>{sale.customerName || 'PÚBLICO EN GENERAL'}</TableCell>
                      <TableCell>
                        {new Date(sale.createdAt || sale.date).toLocaleString('es-MX')}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {itemsList.length} artículos
                          </Typography>
                          {itemsList.length > 0 && (
                            <IconButton 
                              size="small" 
                              color="info" 
                              onClick={() => handleOpenPreview(sale)}
                              title="Ver ticket"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        ${parseFloat(sale.total).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </DialogContent>
        <Box p={2}>
          <Button onClick={onClose} fullWidth variant="outlined">Cerrar Historial</Button>
        </Box>
      </Dialog>

      <Dialog 
        open={isPreviewOpen} 
        onClose={handleClosePreview} 
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', pb: 1 }}>
          Vista Previa
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: '450px', backgroundColor: '#f5f5f5' }}>
          {ticketHTML ? (
            <iframe
              srcDoc={ticketHTML}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Vista previa del ticket"
            />
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography color="text.secondary">Generando ticket...</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 2, pt: 1, gap: 1 }}>
          <Button onClick={handleClosePreview} variant="outlined" color="inherit" sx={{ flex: 1 }}>
            Cerrar
          </Button>
          <Button 
            onClick={handlePrintTicket} 
            variant="contained" 
            color="primary" 
            startIcon={<Print />}
            disabled={!ticketHTML}
            sx={{ flex: 1 }}
          >
            Imprimir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}