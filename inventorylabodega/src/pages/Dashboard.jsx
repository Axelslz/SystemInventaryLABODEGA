import { Typography, Container } from '@mui/material';

export default function Dashboard() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Reporte Semanal</Typography>
      <Typography variant="body1">Aquí irán las gráficas de ganancias vs inversión.</Typography>
    </Container>
  );
}