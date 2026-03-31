import api from '../lib/api';

export const saleService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/ventas', { params });
    return data;
  },
  
  create: async (payload: any) => {
    const { data } = await api.post('/ventas', payload);
    return data;
  },
  
  annul: async (id: number) => {
    const { data } = await api.put(`/ventas/anular/${id}`);
    return data;
  }
};
