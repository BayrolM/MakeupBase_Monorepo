import { Categoria, Producto } from "../lib/store";

export const validateCategoryNombre = (
  value: string,
  categorias: Categoria[],
  excludeId?: string
) => {
  if (!value.trim()) return "El nombre es obligatorio";
  if (value.trim().length < 3) return "Mínimo 3 caracteres";
  if (value.trim().length > 50) return "Máximo 50 caracteres";
  
  const duplicate = categorias.find(
    (c) =>
      c.nombre.toLowerCase() === value.trim().toLowerCase() &&
      c.id !== excludeId
  );
  
  if (duplicate) return "Ya existe una categoría con este nombre";
  return "";
};

export const getCategoryProductCount = (
  categoriaId: string,
  productos: Producto[]
) => {
  return productos.filter((p) => p.categoriaId === categoriaId).length;
};
