import api from './api';

export const createSaleService = async (saleData) => {
  const response = await api.post('/sales', saleData);
  return response.data;
};

export const getSalesHistoryService = async () => {
  const response = await api.get('/sales');
  return response.data;
};