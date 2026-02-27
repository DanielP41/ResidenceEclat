'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface OccupancyData {
    name: string;
    value: number;
    color: string;
}

interface OccupancyChartProps {
    data: {
        occupied: number;
        vacant: number;
        reserved: number;
        partial: number;
    };
}

export const OccupancyChart = ({ data }: OccupancyChartProps) => {
    const chartData: OccupancyData[] = [
        { name: 'Ocupadas', value: data.occupied, color: '#C05621' }, // Orange-ish
        { name: 'Desocupadas', value: data.vacant, color: '#2B6CB0' }, // Blue-ish
        { name: 'Reservadas', value: data.reserved, color: '#22543D' }, // Green-ish
        { name: 'Parcialmente Libres', value: data.partial, color: '#D69E2E' }, // Yellow-ish
    ];

    return (
        <div className="w-full h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1500}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#111',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-white/60 text-sm">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
