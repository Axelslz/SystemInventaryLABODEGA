import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Typography, CircularProgress, Box 
} from '@mui/material';
import { CheckCircle, AssignmentInd } from '@mui/icons-material';
import { getSalesRequest } from '../services/saleService';

export default function DebtorsModal({ open, onClose, onMarkAsPaid }) {
  const [loading, setLoading] = useState(false);
  const [dbSales, setDbSales] = useState([]);

  useEffect(() => {
    if (open) {
      loadSalesFromDB();
    }
  }, [open]);

  const loadSalesFromDB = async () => {
    setLoading(true);
    try {
      const res = await getSalesRequest();
      if (res.data) {
        const creditos = res.data.filter(s => s.paymentMethod === 'CREDITO');
        const ordenados = creditos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setDbSales(ordenados);
      }
    } catch (error) {
      console.error("Error cargando deudores:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: '#ed6c02', display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssignmentInd /> Cuentas por Cobrar (Deudores)
      </DialogTitle>
      
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : dbSales.length === 0 ? (
          <Typography align="center" sx={{ py: 3, color: 'text.secondary' }}>
            No se encontraron deudas pendientes en la Base de Datos.
          </Typography>
        ) : (
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: '#fff3e0' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dbSales.map((sale) => {
                  const isPaid = sale.status === 'PAID'; 

                  return (
                    <TableRow key={sale.id} hover>
    
                      <TableCell>{formatDate(sale.createdAt)}</TableCell>
                      
                      <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {sale.customerName || 'CLIENTE DESCONOCIDO'}
                      </TableCell>
                      
                      <TableCell sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        ${parseFloat(sale.total).toFixed(2)}
                      </TableCell>

                      <TableCell align="center">
                        <Chip 
                          label={isPaid ? "PAGADO" : "PENDIENTE"} 
                          color={isPaid ? "success" : "warning"} 
                          size="small" 
                          variant={isPaid ? "filled" : "outlined"}
                        />
                      </TableCell>
                      
                      <TableCell align="center">
                        {!isPaid && (
                          <Button 
                            variant="contained" 
                            color="success" 
                            size="small"
                            startIcon={<CheckCircle />}
                            onClick={() => {
                                if(window.confirm(`¿Confirmar pago de ${sale.customerName}?`)){
                                    onMarkAsPaid(sale.id);
                                }
                            }}
                          >
                            Cobrar
                          </Button>
                        )}
                        {isPaid && <CheckCircle color="success" fontSize="small"/>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}