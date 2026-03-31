import api from '../lib/api';

export interface Marca {
  id_marca: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
}

export const marcaService = {
  async getAll(): Promise<Marca[]> {
    try {
      const response = await api.get('/marcas');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener marcas');
    }
  }
};
