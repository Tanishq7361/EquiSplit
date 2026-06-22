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
      <h4 style={{ marginBottom: "20px" }}>
        Category Wise Expense
      </h4>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "210px"
        }}
      >
        <div style={{ width: "55%", height: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                innerRadius={0}
                outerRadius={90}
                paddingAngle={1}
                cornerRadius={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            width: "40%",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}
        >
          {data.map((item, index) => (
            <div
              key={item.category}
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
                  gap: "3px"
                }}
              >
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: COLORS[index % COLORS.length]
                  }}
                />

                <span
                  style={{
                    fontSize:"12px"
                  }}
                >{item.category}</span>
              </div>

              <strong
                style={{
                    fontSize:"12px"
                  }}
              >
                ₹{Number(item.amount).toFixed(2)}
              </strong>
            </div>
          ))}

          <hr
            style={{
              borderColor: "#334155"
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              fontSize: "1rem"
            }}
          >
            <span>Total</span>

            <span>
              ₹{Number(total).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}