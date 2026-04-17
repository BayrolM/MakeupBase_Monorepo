import { Producto } from "../lib/store";

export const validateProductField = (name: string, value: string) => {
  switch (name) {
    case "nombre":
      if (!value.trim()) return "El nombre es obligatorio";
      if (value.trim().length < 4) return "Mínimo 4 caracteres";
      if (value.trim().length > 80) return "Máximo 80 caracteres";
      return "";
    case "categoriaId":
      if (!value) return "La categoría es obligatoria";
      return "";
    case "marcaId":
      if (!value) return "La marca es obligatoria";
      return "";
    default:
      return "";
  }
};

export const getStockStatus = (product: Producto) => {
  if (product.stock <= product.stockMinimo) {
    return {
      type: "low",
      color: "text-[#FFA500]",
      bgColor: "bg-[#FFA500]/10",
      label: "BAJO",
      message: "Stock mínimo alcanzado",
    };
  } else if (product.stock >= product.stockMaximo) {
    return {
      type: "high",
      color: "text-[#FF8C00]",
      bgColor: "bg-[#FF8C00]/10",
      label: "MÁXIMO",
      message: "Stock máximo alcanzado",
    };
  }
  return null;
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
};
