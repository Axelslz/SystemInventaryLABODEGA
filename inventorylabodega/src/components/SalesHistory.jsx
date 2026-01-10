import { Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';

export default function SalesHistory({ open, onClose, sales }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Historial de Ventas</DialogTitle>
      <DialogContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Folio</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Productos</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(!sales || sales.length === 0) ? (
              <TableRow><TableCell colSpan={4} align="center">Cargando o sin ventas...</TableCell></TableRow>
            ) : (
              sales.map((sale) => {
                const itemsList = sale.SaleItems || sale.items || [];
                
                return (
                  <TableRow key={sale.id}>
                    <TableCell>#{sale.id}</TableCell>
                    <TableCell>
                      {new Date(sale.createdAt).toLocaleString('es-MX')}
                    </TableCell>
                    <TableCell>
                      {itemsList.length} artículos
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      ${parseFloat(sale.total).toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <Button onClick={onClose} sx={{ mt: 2 }} fullWidth variant="outlined">Cerrar</Button>
      </DialogContent>
    </Dialog>
  );
}