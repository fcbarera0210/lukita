'use client';

import { Category } from '@/types/category';

interface CategoryData {
  categoryId: string;
  amount: number;
  category: Category;
  percentage: number;
}

interface PieChartProps {
  data: CategoryData[];
}

// Colores para las secciones del gráfico de torta
const PIE_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // green-500
  '#EF4444', // red-500
  '#F59E0B', // yellow-500
  '#8B5CF6', // purple-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#F97316', // orange-500
];

export function PieChart({ data }: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay datos para mostrar
      </div>
    );
  }

  // Calcular los ángulos para cada sección
  let cumulativePercentage = 0;
  const segments = data.map((item, index) => {
    const startAngle = (cumulativePercentage * 360) / 100;
    const endAngle = ((cumulativePercentage + item.percentage) * 360) / 100;
    cumulativePercentage += item.percentage;

    return {
      ...item,
      startAngle,
      endAngle,
      color: PIE_COLORS[index % PIE_COLORS.length],
    };
  });

  // Función para crear el path SVG de cada sección
  const createArcPath = (startAngle: number, endAngle: number, radius: number = 40) => {
    const start = polarToCartesian(50, 50, radius, endAngle);
    const end = polarToCartesian(50, 50, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", 50, 50,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* SVG Pie Chart */}
      <div className="relative">
        <svg width="120" height="120" viewBox="0 0 100 100" className="transform -rotate-90">
          {segments.map((segment, index) => (
            <path
              key={segment.categoryId}
              d={createArcPath(segment.startAngle, segment.endAngle)}
              fill={segment.color}
              stroke="white"
              strokeWidth="1"
              className="transition-all duration-300 hover:opacity-80"
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2 w-full">
        {segments.map((segment, index) => (
          <div key={segment.categoryId} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm font-medium">{segment.category.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {segment.percentage.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
