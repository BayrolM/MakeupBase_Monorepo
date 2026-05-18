import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { C, V } from "../../styles/dashboardStyles";

interface VentasMesChartProps {
  data: any[];
  formatCurrency: (value: number) => string;
}

export const VentasMesChart: React.FC<VentasMesChartProps> = ({ data, formatCurrency }) => {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        border: `1px solid ${C.accent}`,
      }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: C.textDark, margin: 0 }}>
            Ventas del Mes
          </h3>
          <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>
            Ingresos diarios durante el mes actual
          </p>
        </div>
      </div>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis
              dataKey="dia"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: V("text-muted"), fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: V("text-muted") }}
              tickFormatter={(value) => {
                if (value === 0) return "$0";
                if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                return `$${value}`;
              }}
              width={50}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.02)" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                padding: "12px",
                background: C.white,
              }}
              formatter={(value: any) => [formatCurrency(value), "Ventas"]}
              labelFormatter={(label) => `Día ${label}`}
              labelStyle={{ fontWeight: 600, color: C.textDark, marginBottom: "4px" }}
            />
            <Bar
              dataKey="total"
              fill={C.accentDeep}
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
