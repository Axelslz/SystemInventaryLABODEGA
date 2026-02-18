import React, { useMemo, useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, 
  Card, CardContent, Divider, useTheme, CircularProgress, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
  Snackbar, Alert, MenuItem, Select, FormControl, InputLabel 
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  AttachMoney, TrendingUp, Inventory, MoneyOff, CalendarMonth, 
  DeleteForever, WarningAmberRounded, FilterAlt 
} from '@mui/icons-material';
import { useInventory } from '../context/InventoryContext';
import { format, subDays, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

import * as expenseService from '../services/expenseService';
import { resetHistoryService } from '../services/saleService'; 

export default function Dashboard() {
  const { sales, products, loadSales } = useInventory(); 
  const theme = useTheme();

  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [openDialog, setOpenDialog] = useState(false); 
  const [loadingReset, setLoadingReset] = useState(false); 
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); 
  
  const [timeFilter, setTimeFilter] = useState('week'); 

  useEffect(() => {
    const fetchAllExpenses = async () => {
      try {
        const [storeExp, warehouseExp, payrollExp] = await Promise.all([
           expenseService.getAll('store'),
           expenseService.getAll('warehouse'),
           expenseService.getAll('payroll')
        ]);
        
        const allExpenses = [
            ...storeExp.map(e => ({ ...e, typeLabel: 'Tienda', amount: parseFloat(e.amount) || 0 })), 
            ...warehouseExp.map(e => ({ ...e, typeLabel: 'Bodega', amount: parseFloat(e.amount) || 0 })), 
            ...payrollExp.map(e => ({ ...e, typeLabel: 'Nómina', amount: parseFloat(e.amount) || 0 }))
        ];
        
        setExpenses(allExpenses);
      } catch (error) {
        console.error("Error cargando gastos", error);
      } finally {
        setLoadingExpenses(false);
      }
    };
    fetchAllExpenses();
  }, []);

  const handleOpenConfirm = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleConfirmReset = async () => {
    setLoadingReset(true);
    try {
        await resetHistoryService();
        if(loadSales) await loadSales();
        
        setOpenDialog(false);
        setSnackbar({ 
            open: true, 
            message: '✅ Sistema reiniciado correctamente.', 
            severity: 'success' 
        });
        setTimeout(() => { window.location.reload(); }, 1500);
    } catch (error) {
        console.error(error);
        setOpenDialog(false);
        setSnackbar({ 
            open: true, 
            message: '❌ Error al reiniciar.', 
            severity: 'error' 
        });
    } finally {
        setLoadingReset(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
 
  const stats = useMemo(() => {
    const today = new Date();
    
    let startDate, endDate;
    if (timeFilter === 'week') {
        startDate = startOfWeek(today, { weekStartsOn: 1 }); 
        endDate = endOfWeek(today, { weekStartsOn: 1 });
    } else if (timeFilter === 'month') {
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
    } else { // 'all'
        startDate = new Date(2000, 0, 1); 
        endDate = new Date(2100, 0, 1);
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i);
      return {
        date: d,
        label: format(d, 'EEE dd', { locale: es }),
        ventas: 0, costo: 0, ganancia: 0
      };
    });

    let totalVentasGlobal = 0;
    let totalCostoMercancia = 0;
    let ventasHoy = 0;

    const currentProducts = Array.isArray(products) ? products : [];

    if (sales && Array.isArray(sales)) {
        sales.forEach(sale => {
            const dateString = sale.createdAt || sale.date || new Date();
            const saleDate = new Date(dateString);
            
            const isWithinFilterRange = isWithinInterval(saleDate, { start: startDate, end: endDate });

            const productsList = sale.SaleItems || sale.items || sale.cart || [];

            let saleCost = 0;
            let saleTotal = parseFloat(sale.total) || 0; 

            productsList.forEach(item => {
                const price = parseFloat(item.price) || 0;
                const quantity = parseInt(item.quantity) || 1;
                let unitCost = 0;
                const idToSearch = item.ProductId || item.id;
                const productInDb = currentProducts.find(p => String(p.id) === String(idToSearch));

                if (productInDb && productInDb.cost) {
                    unitCost = parseFloat(productInDb.cost);
                } else if (item.cost) {
                    unitCost = parseFloat(item.cost);
                } else {
                    unitCost = price * 0.70;
                }
                
                saleCost += unitCost * quantity;
            });

            const saleProfit = saleTotal - saleCost;
            
            if (isWithinFilterRange) {
                totalVentasGlobal += saleTotal;
                totalCostoMercancia += saleCost;
            }

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
    }

    const gastosFiltrados = expenses.filter(exp => {
         const expDate = new Date(exp.date || exp.createdAt || new Date());
         return isWithinInterval(expDate, { start: startDate, end: endDate });
    });

    const totalGastosOperativos = gastosFiltrados.reduce((acc, item) => acc + item.amount, 0);

    const gastosPorTipo = [
        { name: 'Tienda', value: 0, color: '#2196f3' }, 
        { name: 'Bodega', value: 0, color: '#009688' }, 
        { name: 'Nómina', value: 0, color: '#ff9800' }  
    ];

    gastosFiltrados.forEach(exp => {
        const category = gastosPorTipo.find(g => g.name === exp.typeLabel);
        if (category) category.value += exp.amount;
    });

    const utilidadBruta = totalVentasGlobal - totalCostoMercancia;
    const utilidadNetaReal = utilidadBruta - totalGastosOperativos;

    return {
      chartData: last7Days,
      totalVentas: totalVentasGlobal,
      totalCostoMercancia: totalCostoMercancia,
      totalGastosOperativos: totalGastosOperativos,
      utilidadNetaReal: utilidadNetaReal,
      ventasHoy,
      pieChartData: gastosPorTipo.filter(x => x.value > 0),
      filterLabel: timeFilter === 'week' ? 'Esta Semana' : timeFilter === 'month' ? 'Este Mes' : 'Histórico General'
    };
  }, [sales, expenses, products, timeFilter]); 

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={3} gap={2}>
         <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
                Dashboard General
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Mostrando datos de: <b>{stats.filterLabel}</b>
            </Typography>
         </Box>
         
         <Box display="flex" gap={2} alignItems="center">
            {/* NUEVO: Selector de Filtro de Tiempo */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="time-filter-label" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FilterAlt fontSize="small" /> Filtro
                </InputLabel>
                <Select
                    labelId="time-filter-label"
                    value={timeFilter}
                    label="Filtro de Tiempo"
                    onChange={(e) => setTimeFilter(e.target.value)}
                    sx={{ bgcolor: 'background.paper' }}
                >
                    <MenuItem value="week">Esta Semana</MenuItem>
                    <MenuItem value="month">Este Mes</MenuItem>
                    <MenuItem value="all">Todo Histórico</MenuItem>
                </Select>
            </FormControl>

            <Button 
                variant="outlined" color="error" startIcon={<DeleteForever />}
                onClick={handleOpenConfirm} 
                sx={{ fontWeight: 'bold', borderColor: '#ef5350', color: '#ef5350' }}
            >
                Reiniciar 
            </Button>
         </Box>
      </Box>

      <Grid container spacing={3} mb={2}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard title="Ventas Totales" value={stats.totalVentas} icon={<AttachMoney fontSize="large" />} color={theme.palette.success.main} subtitle="Ingreso Bruto" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard title="Total Invertido" value={stats.totalCostoMercancia} icon={<Inventory fontSize="large" />} color={theme.palette.warning.main} subtitle="Costo Mercancía" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard title="Gastos Operativos" value={stats.totalGastosOperativos} icon={<MoneyOff fontSize="large" />} color="#d32f2f" subtitle="Nómina + Servicios" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard title="Ganancia Neta Real" value={stats.utilidadNetaReal} icon={stats.utilidadNetaReal >= 0 ? <TrendingUp fontSize="large" /> : <MoneyOff fontSize="large"/>} color={stats.utilidadNetaReal >= 0 ? theme.palette.primary.main : '#d32f2f'} subtitle="Utilidad Final" />
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Paper elevation={1} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: theme.palette.mode === 'dark' ? 'rgba(2, 136, 209, 0.1)' : '#e3f2fd', borderLeft: `4px solid ${theme.palette.info.main}` 
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <CalendarMonth color="info" />
            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
              {format(new Date(), "dd 'de' MMMM", { locale: es })}
            </Typography>
            
          </Box>
          <Chip label={`Ventas Hoy: $${stats.ventasHoy.toFixed(2)}`} color="info" sx={{ fontWeight: 'bold', fontSize: '1rem' }} />
        </Paper>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '400px', display:'flex', flexDirection:'column' }}>
            <Typography variant="h6" gutterBottom color="text.secondary">Flujo de Caja Semanal (Últimos 7 días)</Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} contentStyle={{ backgroundColor: '#fff', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="ventas" name="Ventas" fill="#4caf50" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costo" name="Costo Prod." fill="#ff9800" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '400px', display:'flex', flexDirection:'column' }}>
            <Typography variant="h6" gutterBottom color="text.secondary">Tendencia de Ganancia</Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2196f3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" hide />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Area type="monotone" dataKey="ganancia" name="Ganancia" stroke="#2196f3" fillOpacity={1} fill="url(#colorGanancia)" />
              </AreaChart>
            </ResponsiveContainer>
            <Box mt={2} textAlign="center">
                <Typography variant="body2" color="text.secondary">Ganancia Bruta (Últimos 7 días)</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    ${stats.chartData.reduce((acc, curr) => acc + curr.ganancia, 0).toFixed(2)}
                </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" color="error">Desglose de Gastos Operativos</Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Distribución de gastos correspondientes a: <b>{stats.filterLabel}</b>.
                        </Typography>
                        <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2, border: '1px solid #ffcdd2', textAlign:'center' }}>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold">TOTAL GASTADO</Typography>
                            <Typography variant="h4" color="error" fontWeight="900">
                                -${stats.totalGastosOperativos.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </Typography>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={8} sx={{ height: 300 }}>
                        {loadingExpenses ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>
                        ) : stats.totalGastosOperativos === 0 ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
                                <MoneyOff color="disabled" sx={{ fontSize: 50, mb:1 }} />
                                <Typography color="text.secondary">No hay gastos en este periodo</Typography>
                            </Box>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {stats.pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f' }}>
          <WarningAmberRounded fontSize="large" />
          {"¿Reiniciar el sistema?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Estás a punto de borrar <b>TODAS las ventas y gastos</b>. Esta acción es irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="primary" variant="outlined" autoFocus>Cancelar</Button>
          <Button 
            onClick={handleConfirmReset} 
            color="error" 
            variant="contained" 
            disabled={loadingReset}
            startIcon={loadingReset ? <CircularProgress size={20} color="inherit"/> : <DeleteForever />}
          >
            {loadingReset ? "Borrando..." : "Sí, Eliminar Historial"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Container>
  );
}

function KPICard({ title, value, icon, color, subtitle }) {
  return (
    <Card elevation={2} sx={{ height: '100%', borderLeft: `5px solid ${color}` }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="overline" fontWeight="bold">{title}</Typography>
            <Typography variant="h4" component="div" fontWeight="800" sx={{ color: value < 0 ? '#d32f2f' : 'text.primary' }}>
              ${value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>{subtitle}</Typography>
          </Box>
          <Box sx={{ bgcolor: `${color}20`, p: 1.5, borderRadius: '50%', color: color, display: 'flex' }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}