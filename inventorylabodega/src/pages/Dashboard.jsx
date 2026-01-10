import React, { useMemo } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, 
  Card, CardContent, Divider, useTheme 
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { AttachMoney, TrendingUp, Inventory, CalendarMonth } from '@mui/icons-material';
import { useInventory } from '../context/InventoryContext';
import { format, subDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard() {
  const { sales } = useInventory();
  const theme = useTheme();

  const stats = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i);
      return {
        date: d,
        label: format(d, 'EEE dd', { locale: es }),
        ventas: 0,
        costo: 0,
        ganancia: 0
      };
    });

    let totalVentasGlobal = 0;
    let totalCostoGlobal = 0;
    let ventasHoy = 0;

    if (!sales || !Array.isArray(sales)) {
      return {
        chartData: last7Days,
        totalVentas: 0,
        totalCosto: 0,
        gananciaNeta: 0,
        ventasHoy: 0
      };
    }

    sales.forEach(sale => {
      const dateString = sale.createdAt || sale.date || new Date();
      const saleDate = new Date(dateString);

      const productsList = sale.SaleItems || sale.items || sale.cart || [];

      let saleCost = 0;
      let saleTotal = parseFloat(sale.total) || 0; 

      productsList.forEach(item => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        
        const itemCost = item.cost ? parseFloat(item.cost) : (price * 0.70); 
        
        saleCost += itemCost * quantity;
      });

      const saleProfit = saleTotal - saleCost;

      totalVentasGlobal += saleTotal;
      totalCostoGlobal += saleCost;

      if (isSameDay(saleDate, today)) {
        ventasHoy += saleTotal;
      }

      const dayStat = last7Days.find(d => isSameDay(d.date, saleDate));
      if (dayStat) {
        dayStat.ventas += saleTotal;
        dayStat.costo += saleCost;
        dayStat.ganancia += saleProfit;
      }
    });

    return {
      chartData: last7Days,
      totalVentas: totalVentasGlobal,
      totalCosto: totalCostoGlobal,
      gananciaNeta: totalVentasGlobal - totalCostoGlobal,
      ventasHoy
    };
  }, [sales]);

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Grid container spacing={3} mb={4}>
        {/* Ventas Totales */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Ventas Totales" 
            value={stats.totalVentas} 
            icon={<AttachMoney fontSize="large" />}
            color={theme.palette.success.main}
            subtitle="Histórico acumulado"
          />
        </Grid>
        
        {/* Inversión (Costo) */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Total Invertido" 
            value={stats.totalCosto} 
            icon={<Inventory fontSize="large" />}
            color={theme.palette.warning.main}
            subtitle="Costo est. mercancía vendida"
          />
        </Grid>

        {/* Ganancia Neta */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Ganancia Neta" 
            value={stats.gananciaNeta} 
            icon={<TrendingUp fontSize="large" />}
            color={theme.palette.primary.main}
            subtitle="Utilidad real estimada"
          />
        </Grid>

        {/* Ventas Hoy */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Ventas Hoy" 
            value={stats.ventasHoy} 
            icon={<CalendarMonth fontSize="large" />}
            color={theme.palette.info.main}
            subtitle={format(new Date(), "dd 'de' MMMM", { locale: es })}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '400px', display:'flex', flexDirection:'column' }}>
            <Typography variant="h6" gutterBottom color="text.secondary">
              Reporte Semanal: Ventas vs Inversión
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `$${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: 8 }}
                />
                <Legend />
                <Bar dataKey="ventas" name="Ventas ($)" fill="#4caf50" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costo" name="Inversión ($)" fill="#ff9800" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '400px', display:'flex', flexDirection:'column' }}>
            <Typography variant="h6" gutterBottom color="text.secondary">
              Tendencia de Ganancia
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2196f3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" hide />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Area 
                  type="monotone" 
                  dataKey="ganancia" 
                  name="Ganancia"
                  stroke="#2196f3" 
                  fillOpacity={1} 
                  fill="url(#colorGanancia)" 
                />
              </AreaChart>
            </ResponsiveContainer>
             <Box mt={2} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Ganancia acumulada últimos 7 días
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                   ${stats.chartData.reduce((acc, curr) => acc + curr.ganancia, 0).toFixed(2)}
                </Typography>
             </Box>
          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
}

function KPICard({ title, value, icon, color, subtitle }) {
  return (
    <Card elevation={2} sx={{ height: '100%', borderLeft: `5px solid ${color}` }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="overline" fontWeight="bold">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="800">
              ${value?.toFixed(2) || '0.00'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {subtitle}
            </Typography>
          </Box>
          <Box sx={{ 
            bgcolor: `${color}20`, 
            p: 1.5, 
            borderRadius: '50%', 
            color: color,
            display: 'flex' 
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}