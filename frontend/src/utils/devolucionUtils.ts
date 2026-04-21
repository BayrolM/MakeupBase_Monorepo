/**
 * Utilidades para el módulo de Devoluciones
 */

export const getEstadoColor = (estado: string) => {
  const colors: Record<string, { bg: string; text: string; label: string }> = {
    pendiente: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-600",
      label: "Pendiente",
    },
    en_revision: {
      bg: "bg-blue-500/10",
      text: "text-blue-600",
      label: "En Revisión",
    },
    aprobada: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      label: "Aprobada",
    },
    rechazada: {
      bg: "bg-rose-500/10",
      text: "text-rose-600",
      label: "Rechazada",
    },
    anulada: {
      bg: "bg-gray-100",
      text: "text-gray-500",
      label: "Anulada",
    },
  };
  return colors[estado] || colors.pendiente;
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
};

export const canChangeEstado = (estado: string) => {
  return (
    estado !== "aprobada" && estado !== "rechazada" && estado !== "anulada"
  );
};

export const canAnularDevolucion = (estado: string) => {
  return estado !== "anulada" && estado !== "rechazada";
};
