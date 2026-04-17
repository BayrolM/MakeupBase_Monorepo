import { Cliente, Venta, Pedido } from "../lib/store";

export const validateClientField = (name: string, value: string, editingCliente?: any) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  switch (name) {
    case "nombres":
    case "apellidos": {
      const label = name === "nombres" ? "El nombre" : "El apellido";
      if (!value.trim()) return `${label} es obligatorio`;
      if (value.trim().length > 80) return `${label} no puede superar 80 caracteres`;
      return "";
    }
    case "numeroDocumento":
      if (!value.trim()) return "El documento es obligatorio";
      if (value.trim().length > 10) return "Máximo 10 caracteres";
      return "";
    case "email":
      if (!value.trim()) return "El email es obligatorio";
      if (!emailRegex.test(value.trim())) return "Formato de email inválido";
      if (value.trim().length > 100) return "Máximo 100 caracteres";
      return "";
    case "passwordHash":
      if (!editingCliente) {
        if (!value) return "La contraseña es obligatoria";
        if (value.length < 8) return "Mínimo 8 caracteres";
      }
      return "";
    case "telefono": {
      if (!value.trim()) return "El teléfono es obligatorio";
      const soloDigitos = /^\d+$/.test(value.trim());
      if (!soloDigitos) return "Solo se permiten números";
      if (value.trim().length < 7) return "Mínimo 7 dígitos";
      if (value.trim().length > 15) return "Máximo 15 dígitos";
      return "";
    }
    case "direccion":
      if (value.trim() && value.trim().length < 3) return "Mínimo 3 caracteres";
      if (value.trim().length > 30) return "Máximo 30 caracteres";
      return "";
    case "ciudad":
      if (value.trim().length > 50) return "Máximo 50 caracteres";
      return "";
    default:
      return "";
  }
};

export const getClientStats = (clienteId: string, ventas: Venta[]) => {
  return ventas.filter((v) => v.clienteId === clienteId && v.estado === "activo").length;
};

export const checkClientActiveConstraints = (clienteId: string, pedidos: Pedido[], ventas: Venta[]) => {
  const pedidosActivos = pedidos.filter(
    (p) => p.clienteId === clienteId && !["entregado", "cancelado"].includes(p.estado)
  );
  const ventasActivas = ventas.filter(
    (v) => v.clienteId === clienteId && v.estado === "activo"
  );
  
  const constraints = [];
  if (pedidosActivos.length > 0) constraints.push(`${pedidosActivos.length} pedido(s) activo(s)`);
  if (ventasActivas.length > 0) constraints.push(`${ventasActivas.length} venta(s) activa(s)`);
  
  return {
    hasConstraints: constraints.length > 0,
    description: constraints.join(" y ")
  };
};
