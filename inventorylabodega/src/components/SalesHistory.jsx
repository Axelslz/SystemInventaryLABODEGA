import { Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';

export default function SalesHistory({ open, onClose, sales }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Historial de Ventas (Sesión Actual)</DialogTitle>
      <DialogContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Folio</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Productos</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">No hay ventas registradas hoy</TableCell></TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>#{sale.id}</TableCell>
                  <TableCell>{sale.date.toLocaleTimeString()}</TableCell>
                  <TableCell>{sale.items.length} artículos</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    ${sale.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Button onClick={onClose} sx={{ mt: 2 }} fullWidth variant="outlined">Cerrar</Button>
      </DialogContent>
    </Dialog>
  );
}