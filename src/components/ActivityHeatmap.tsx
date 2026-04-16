'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface ActivityHeatmapProps {
  data: Array<{ date: string; count: number }>;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Get color intensity based on activity count
  const getColor = (count: number) => {
    if (count === 0) return '#E5E7EB'; // Gray for no activity
    if (count >= 9) return '#5F7C50'; // Dark green for full day (9/9 activities)
    if (count >= 5) return '#7A9B6A'; // Medium green
    if (count >= 1) return '#A6B89E'; // Light green for partial
    return '#E5E7EB';
  };

  // Group data by weeks (7 days per row)
  const weeks: Array<Array<{ date: string; count: number }>> = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  // Format date for tooltip
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleMouseMove = (e: React.MouseEvent, day: { date: string; count: number }) => {
    setHoveredDay(day);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="relative">
      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex flex-col gap-1 min-w-full">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={`${weekIndex}-${dayIndex}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (weekIndex * 7 + dayIndex) * 0.002 }}
                  onMouseEnter={(e) => handleMouseMove(e, day)}
                  onMouseMove={(e) => handleMouseMove(e, day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-150"
                  style={{ backgroundColor: getColor(day.count) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/60 font-sans mt-4">
        <span>Menos</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#E5E7EB' }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#A6B89E' }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#7A9B6A' }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#5F7C50' }} />
        </div>
        <span>Mais</span>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y + 10,
          }}
        >
          <div className="bg-[#1A1A1A] text-white px-3 py-2 rounded-lg shadow-lg text-xs font-sans">
            <div className="font-bold">{formatDate(hoveredDay.date)}</div>
            <div className="text-white/80">
              {hoveredDay.count} {hoveredDay.count === 1 ? 'atividade' : 'atividades'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
