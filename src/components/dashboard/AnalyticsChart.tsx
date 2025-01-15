'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface DataPoint {
  date: string;
  value: number;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  label: string;
  type: 'line' | 'bar';
  color?: string;
}

export default function AnalyticsChart({
  data,
  label,
  type,
  color = '#4F46E5'
}: AnalyticsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
          type,
          data: {
            labels: data.map(d => d.date),
            datasets: [
              {
                label,
                data: data.map(d => d.value),
                borderColor: color,
                backgroundColor: type === 'line' ? 'transparent' : color + '80',
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return value + (label.includes('%') ? '%' : '');
                  },
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, label, type, color]);

  return (
    <div className="w-full h-64">
      <canvas ref={chartRef} />
    </div>
  );
}
