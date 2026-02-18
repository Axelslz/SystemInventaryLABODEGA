import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, 
  TableHead, TableRow, Button, IconButton, Popover, Box, Typography,
  List, ListItem, ListItemText, Divider 
} from '@mui/material';
import { Visibility } from '@mui/icons-material';

export default function SalesHistory({ open, onClose, sales }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentItems, setCurrentItems] = useState([]);

  const handleOpenPopover = (event, items) => {
    setAnchorEl(event.currentTarget);
    setCurrentItems(items);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const isPopoverOpen = Boolean(anchorEl);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Historial de Ventas</DialogTitle>
      <DialogContent dividers>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Folio</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Productos</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(!sales || sales.length === 0) ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}>Cargando o sin ventas...</TableCell></TableRow>
            ) : (
              sales.map((sale) => {
                const itemsList = sale.SaleItems || sale.items || sale.cart || [];
                
                return (
                  <TableRow key={sale.id} hover>
                    <TableCell>#{sale.id || sale.ticketNumber}</TableCell>
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
                            onClick={(e) => handleOpenPopover(e, itemsList)}
                            title="Ver detalles"
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

        <Popover
          open={isPopoverOpen}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{ sx: { width: 350, maxHeight: 400 } }}
        >
          <Box sx={{ p: 2, bgcolor: '#1976d2', color: 'white' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Detalle de artículos
            </Typography>
          </Box>
          <List dense sx={{ pt: 0 }}>
            {currentItems.map((item, index) => {
              const nombreMostrado = item.productName || item.name || 'Producto';
              const precio = parseFloat(item.price || 0);
              const cantidad = parseInt(item.quantity || 1);

              return (
                <React.Fragment key={item.id || index}>
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <ListItemText 
                      primary={<Typography variant="body2" fontWeight="bold">{nombreMostrado}</Typography>} 
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {cantidad} x ${precio.toFixed(2)}
                        </Typography>
                      }
                    />
                    <Typography variant="body2" fontWeight="bold" sx={{ alignSelf: 'flex-end', color: 'success.main' }}>
                      ${(cantidad * precio).toFixed(2)}
                    </Typography>
                  </ListItem>
                  {index < currentItems.length - 1 && <Divider component="li" />}
                </React.Fragment>
              )
            })}
          </List>
        </Popover>

      </DialogContent>
      <Box p={2}>
        <Button onClick={onClose} fullWidth variant="outlined">Cerrar</Button>
      </Box>
    </Dialog>
  );
} 