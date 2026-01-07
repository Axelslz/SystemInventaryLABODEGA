import api from './api';

export const createSaleService = async (saleData) => {
  // saleData debe incluir: { cart, total, paymentMethod, seller, customer }
  const response = await api.post('/sales', saleData);
  return response.data;
};

export const getSalesHistoryService = async () => {
  const response = await api.get('/sales');
  return response.data;
};