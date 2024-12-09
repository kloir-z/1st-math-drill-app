import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import _ from 'lodash';
import { useLearningHistory } from '../hooks/useLearningHistory';
import { ProblemType } from '../types/mathProblems';
import { allProblems } from '../data/mathProblems';

interface ProblemMedianTime {
    problemId: string;
    medianTime: number;
    attemptCount: number;
    type: ProblemType;
    displayId: string;
}

type SortType = 'time' | 'id';

const TYPE_COLORS = {
    [ProblemType.AdditionNoCarry]: '#3b82f6',
    [ProblemType.SubtractionNoBorrow]: '#ef4444',
    [ProblemType.AdditionWithCarry]: '#22c55e',
    [ProblemType.SubtractionWithBorrow]: '#f59e0b',
};

export const ProblemStats = () => {
    const { history } = useLearningHistory();
    const [sortType, setSortType] = useState<SortType>('time');

    const calculateMedianTimes = (): ProblemMedianTime[] => {
        let stats = Object.entries(history.problemHistories)
            .map(([problemId, problemHistory]) => {
                const times = problemHistory.attempts.map(a => a.answeredTime);
                let averageTime;
                if (times.length === 1) {
                    averageTime = times[0];
                } else {
                    const sortedTimes = _.sortBy(times);
                    averageTime = times.length % 2 === 0
                        ? (sortedTimes[times.length / 2 - 1] + sortedTimes[times.length / 2]) / 2
                        : sortedTimes[Math.floor(times.length / 2)];
                }

                let type: ProblemType = ProblemType.AdditionNoCarry;
                for (const [problemType, problems] of Object.entries(allProblems)) {
                    if (problems.some(p => `${p.num1}${p.operator}${p.num2}` === problemId)) {
                        type = problemType as ProblemType;
                        break;
                    }
                }

                return {
                    problemId,
                    displayId: `${problemId} (${times.length})`,
                    medianTime: Math.round(averageTime) / 1000,
                    attemptCount: times.length,
                    type
                };
            })
            .filter(stat => stat.attemptCount >= 1);

        if (sortType === 'time') {
            stats = _.orderBy(stats, 'medianTime', 'desc');
        } else {
            stats = _.sortBy(stats, ['type', 'problemId']);
        }

        return stats;
    };

    const medianTimes = calculateMedianTimes();

    if (medianTimes.length === 0) {
        return (
            <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="text-lg font-bold mb-2">かいとうじかん</h3>
                <p className="text-gray-600">まだ データが ありません</p>
            </div>
        );
    }

    const calculateChartHeight = () => {
        const baseHeight = 40;
        const minHeight = 256;
        const calculatedHeight = Math.max(baseHeight * medianTimes.length, minHeight);
        return calculatedHeight;
    };

    const longestProblemId = medianTimes.reduce((longest, current) =>
        current.displayId.length > longest.length ? current.displayId : longest,
        ''
    );
    const leftMargin = Math.max(longestProblemId.length * 8 + 10, 30);

    return (
        <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">かいとうじかん</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSortType('time')}
                        className={`px-3 py-1 rounded text-sm ${sortType === 'time'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        じかん順
                    </button>
                    <button
                        onClick={() => setSortType('id')}
                        className={`px-3 py-1 rounded text-sm ${sortType === 'id'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        もんだい順
                    </button>
                </div>
            </div>
            <div style={{ height: `${calculateChartHeight()}px` }} className="w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={medianTimes}
                        layout="vertical"
                        margin={{
                            top: 5,
                            right: 30,
                            left: leftMargin,
                            bottom: 35
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            label={{
                                value: 'びょう',
                                position: 'bottom',
                                offset: 0
                            }}
                        />
                        <YAxis
                            type="category"
                            dataKey="displayId"
                            width={leftMargin - 10}
                            tick={{ fontSize: 14 }}
                            interval={0}
                        />
                        <Tooltip
                            formatter={(value: number) => [`${value.toFixed(2)}びょう`, 'かいとうじかん']}
                            labelFormatter={(label: string) => `もんだい: ${label.split(' ')[0]}`}
                            contentStyle={{ fontSize: '0.875rem' }}
                        />
                        <Bar
                            dataKey="medianTime"
                            name="medianTime"
                            barSize={20}
                        >
                            {medianTimes.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.type]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};