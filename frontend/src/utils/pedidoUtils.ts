import React from "react";
import { 
  Clock, 
  Package, 
  Edit, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  ShoppingBag 
} from "lucide-react";
import { OrderStatus } from "../lib/store";

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
};

export const getStatusColor = (status: OrderStatus) => {
  const colors: Record<
    OrderStatus,
    { bg: string; text: string; label: string; icon: React.ReactNode }
  > = {
    pendiente: {
      bg: "bg-blue-50/50",
      text: "text-blue-600",
      label: "Pendiente",
      icon: React.createElement(Clock, { className: "w-3.5 h-3.5" }),
    },
    preparado: {
      bg: "bg-amber-50/50",
      text: "text-amber-600",
      label: "Preparado",
      icon: React.createElement(Package, { className: "w-3.5 h-3.5" }),
    },
    procesando: {
      bg: "bg-indigo-50/50",
      text: "text-indigo-600",
      label: "Procesando",
      icon: React.createElement(Edit, { className: "w-3.5 h-3.5" }),
    },
    enviado: {
      bg: "bg-purple-50/50",
      text: "text-purple-600",
      label: "Enviado",
      icon: React.createElement(Truck, { className: "w-3.5 h-3.5" }),
    },
    entregado: {
      bg: "bg-emerald-50/50",
      text: "text-emerald-700",
      label: "Entregado",
      icon: React.createElement(CheckCircle2, { className: "w-3.5 h-3.5" }),
    },
    cancelado: {
      bg: "bg-[#fff0f5]",
      text: "text-[#c47b96]",
      label: "Cancelado",
      icon: React.createElement(XCircle, { className: "w-3.5 h-3.5" }),
    },
    carrito: {
      bg: "bg-gray-50/50",
      text: "text-gray-600",
      label: "Carrito",
      icon: React.createElement(ShoppingBag, { className: "w-3.5 h-3.5" }),
    },
  };
  return colors[status] || colors["pendiente"];
};

export const getTrackingUrl = (transportadora: string, guia: string) => {
  switch (transportadora) {
    case "Servientrega":
      return `https://www.servientrega.com/wps/portal/Colombia/transaccional/rastreo-envios?id=${guia}`;
    case "Envia":
      return `https://envia.co/rastreo-de-guias?guia=${guia}`;
    case "Coordinadora":
      return `https://www.coordinadora.com/rastreo/rastreo-de-guia/detalle-de-rastreo-de-guia/?guia=${guia}`;
    case "Interrapidisimo":
      return `https://www.interrapidisimo.com/sigue-tu-envio/?guia=${guia}`;
    default:
      return "";
  }
};
