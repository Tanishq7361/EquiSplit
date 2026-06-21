import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export default function CategoryPieChart({ data }) {

  const total = data.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <div
      style={{
        width: "100%",
        height: 280,
        background: "var(--color-surface)",
        borderRadius: "16px",
        padding: "12px"
      }}
    >
      <h3 style={{ marginBottom: "20px" }}>
        Category Wise Expense
      </h3>

      <ResponsiveContainer width="100%" height="90%">
        <PieChart>

          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={3}
            cornerRadius={8}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>
      </ResponsiveContainer>

      <div
        style={{
          position: "relative",
          marginTop: "-185px",
          textAlign: "center",
          pointerEvents: "none"
        }}
      >
        <div
          style={{
            fontSize: "1.6rem",
            fontWeight: "bold"
          }}
        >
          ₹{total}
        </div>

        <div
          style={{
            color: "#94a3b8"
          }}
        >
          Total
        </div>
      </div>

    </div>
  );
}