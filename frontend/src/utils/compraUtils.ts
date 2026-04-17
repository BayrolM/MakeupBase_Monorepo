export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
};

export const getCompraStatusColor = (estado: "confirmada" | "anulada") => {
  if (estado === "confirmada") {
    return {
      bg: "bg-emerald-50/50",
      text: "text-emerald-700",
      label: "Confirmada",
    };
  }
  return {
    bg: "bg-[#fff0f5]",
    text: "text-[#c47b96]",
    label: "Anulada",
  };
};
