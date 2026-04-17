export const formatNIT = (nit: string) => {
  if (!nit) return "N/A";
  // Formato básico de NIT: 123.456.789-0 (opcional según necesidad)
  return nit;
};

export const getProveedorStatusColor = (estado: "activo" | "inactivo") => {
  if (estado === "activo") {
    return {
      bg: "bg-emerald-50/50",
      text: "text-emerald-700",
      label: "Activo",
    };
  }
  return {
    bg: "bg-[#fff0f5]",
    text: "text-[#c47b96]",
    label: "Inactivo",
  };
};
