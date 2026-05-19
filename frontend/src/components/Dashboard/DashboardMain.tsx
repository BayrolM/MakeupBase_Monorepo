import { useStore } from "../../lib/store";
import { PageHeader } from "../layout/PageHeader";
import { 
  TrendingUp, 
  ShoppingCart, 
  RotateCcw, 
  LayoutDashboard,
  Package
} from "lucide-react";
import { useDashboardData } from "../../hooks/useDashboardData";
import { C } from "../../styles/dashboardStyles";

// Sub-components
import { StatCard } from "./StatCard";
import { SalesTrendChart } from "./SalesTrendChart";
import { VentasMesChart } from "./VentasMesChart";
import { OrderStatusPie } from "./OrderStatusPie";
import { RankingMesCard } from "./RankingMesCard";
import { CriticalStockCard } from "./CriticalStockCard";

export function Dashboard() {
  const { productos } = useStore();
  const { 
    safeData, 
    salesComparison,
    ordersByStatus, 
    productosStockCriticoList, 
    trendChartData, 
    ventasMesChartData,
    formatCurrency 
  } = useDashboardData();

  const formatCrecimiento = (valor: number | undefined) => {
    if (valor === undefined) return "0%";
    const sign = valor > 0 ? "+" : "";
    return `${sign}${valor.toFixed(1)}%`;
  };

  const crecimientoVentas = formatCrecimiento(salesComparison?.resumen?.crecimiento);

  return (
    <div
      className="min-h-screen relative"
      style={{ background: C.bgSoft, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="relative mb-6">
        <PageHeader
          title="Panel de Control"
          subtitle="Métricas estratégicas y estado del negocio"
          icon={LayoutDashboard}
        />
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Ingresos Totales" 
            value={formatCurrency(safeData.resumen.total_ventas)} 
            icon={TrendingUp} 
            trend={crecimientoVentas} 
          />
          <StatCard 
            title="Pedidos Realizados" 
            value={safeData.resumen.total_ordenes} 
            icon={ShoppingCart} 
          />
          <StatCard 
            title="Devoluciones Pendientes" 
            value={safeData.resumen.devoluciones_pendientes} 
            icon={RotateCcw} 
            isNegative={safeData.resumen.devoluciones_pendientes > 0}
          />
          <StatCard 
            title="Alerta Stock Bajo" 
            value={safeData.resumen.productos_bajo_stock} 
            icon={Package} 
            isNegative 
          />
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesTrendChart data={trendChartData} formatCurrency={formatCurrency} />
          <VentasMesChart data={ventasMesChartData} formatCurrency={formatCurrency} />
        </div>

        {/* Detailed Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RankingMesCard 
            products={safeData.productos_mas_vendidos} 
            allProducts={productos} 
          />
          
          <div className="space-y-6">
            <OrderStatusPie data={ordersByStatus} />
            <CriticalStockCard products={productosStockCriticoList} />
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}
