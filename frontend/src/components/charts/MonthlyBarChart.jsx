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

export default function MonthlyBarChart({ data }) {

    return (

        <div
            style={{
                width: "100%",
                height: 280,
                background: "var(--color-surface)",
                borderRadius: "16px",
                padding: "20px"
            }}
        >

            <h3
                style={{
                    marginBottom: "20px"
                }}
            >
                Monthly Expenses
            </h3>

            <ResponsiveContainer width="100%" height="90%">

                <BarChart data={data}>

                    <CartesianGrid
                        strokeDasharray="3 3"
                    />

                    <XAxis dataKey="month" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                        dataKey="totalAmount"
                        radius={[8,8,0,0]}
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>

    );

}