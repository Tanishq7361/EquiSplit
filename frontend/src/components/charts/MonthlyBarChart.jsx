import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function MonthlyBarChart({ data = [] }) {
  return (
    <div
      style={{
        width: "100%",
        height: 290,
        background: "var(--color-surface)",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Monthly Spending Trend
        </h4>
        <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600 }}>
          {data.length} {data.length === 1 ? 'month' : 'months'}
        </span>
      </div>

      {data.length === 0 ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "210px",
          color: "var(--color-text-muted)",
          fontSize: "var(--text-xs)"
        }}>
          No monthly expense history yet
        </div>
      ) : (
        <div style={{ width: "100%", height: "210px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="var(--color-text-muted)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="var(--color-text-muted)"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                formatter={(val) => [`₹${Number(val).toFixed(2)}`, 'Total Expense']}
                contentStyle={{
                  backgroundColor: "var(--color-surface-2)",
                  borderColor: "var(--color-border)",
                  borderRadius: "8px",
                  color: "var(--color-text-primary)",
                  fontSize: "12px"
                }}
              />
              <Bar
                dataKey="totalAmount"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}