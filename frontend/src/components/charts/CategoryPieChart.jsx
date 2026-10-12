import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#059669",
  "#d97706",
  "#e11d48",
  "#7c3aed",
  "#0891b2",
];

export default function CategoryPieChart({ data = [] }) {
  const total = data.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

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
          Category-wise Breakdown
        </h4>
        <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600 }}>
          TOTAL: ₹{Number(total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
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
          No category expenses recorded yet
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "210px",
            gap: "16px"
          }}
        >
          <div style={{ width: "50%", height: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={36}
                  outerRadius={75}
                  paddingAngle={2}
                  cornerRadius={3}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                      stroke="var(--color-surface)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: "var(--color-surface-2)",
                    borderColor: "var(--color-border)",
                    borderRadius: "8px",
                    color: "var(--color-text-primary)",
                    fontSize: "12px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              width: "50%",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "190px",
              overflowY: "auto",
              paddingRight: "4px"
            }}
          >
            {data.map((item, index) => (
              <div
                key={item.category || index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: COLORS[index % COLORS.length]
                    }}
                  />
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--color-text-secondary)",
                      textTransform: "capitalize"
                    }}
                  >
                    {item.category}
                  </span>
                </div>

                <strong
                  style={{
                    fontSize: "11px",
                    color: "var(--color-text-primary)"
                  }}
                >
                  ₹{Number(item.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}