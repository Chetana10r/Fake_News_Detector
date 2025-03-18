import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const Statistics = () => {
  const [stats, setStats] = useState({ total: 0, fake: 0, real: 0 });

  useEffect(() => {
    fetch("http://127.0.0.1:5000/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          total: data.total || 0,
          fake: data.fake || 0,
          real: data.real || 0,
        });
      })
      .catch((error) => console.error("Error fetching stats:", error));
  }, []);

  const chartData = [
    { name: "Fake News", value: stats.fake },
    { name: "Real News", value: stats.real },
  ];

  const COLORS = ["#FF4C4C", "#4CAF50"];

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-sm p-5 bg-gray-800 shadow-lg rounded-lg text-center">
        <h2 className="text-lg font-bold mb-3">Platform Statistics</h2>
        <p className="text-sm mb-3">Total News Analyzed: {stats.total}</p>

        {/* Pie Chart - Smaller for better fit */}
        <div className="flex justify-center">
          <PieChart width={220} height={220}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
          </PieChart>
        </div>

        {/* Statistics Details - More Compact */}
        <div className="mt-3 text-sm">
          <p className="text-green-400">✅ Real News: {stats.real}</p>
          <p className="text-red-400">🚨 Fake News: {stats.fake}</p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
