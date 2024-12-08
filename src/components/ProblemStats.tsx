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
}

type SortType = 'time' | 'id';

const TYPE_COLORS = {
    [ProblemType.AdditionNoCarry]: '#3b82f6',      // blue
    [ProblemType.SubtractionNoBorrow]: '#ef4444',   // red
    [ProblemType.AdditionWithCarry]: '#22c55e',     // green
    [ProblemType.SubtractionWithBorrow]: '#f59e0b', // amber
};

export const ProblemStats = () => {
    const { history } = useLearningHistory();
    const [sortType, setSortType] = useState<SortType>('time');

    // 各問題の中央値を計算
    const calculateMedianTimes = (): ProblemMedianTime[] => {
        let stats = Object.entries(history.problemHistories)
            .map(([problemId, problemHistory]) => {
                const times = problemHistory.attempts.map(a => a.answeredTime);
                const sortedTimes = _.sortBy(times);
                const medianTime = times.length % 2 === 0
                    ? (sortedTimes[times.length / 2 - 1] + sortedTimes[times.length / 2]) / 2
                    : sortedTimes[Math.floor(times.length / 2)];

                let type: ProblemType = ProblemType.AdditionNoCarry;
                for (const [problemType, problems] of Object.entries(allProblems)) {
                    if (problems.some(p => `${p.num1}${p.operator}${p.num2}` === problemId)) {
                        type = problemType as ProblemType;
                        break;
                    }
                }

                return {
                    problemId,
                    medianTime: Math.round(medianTime) / 1000,
                    attemptCount: times.length,
                    type
                };
            })
            .filter(stat => stat.attemptCount >= 2);

        // ソート
        if (sortType === 'time') {
            stats = _.sortBy(stats, 'medianTime');
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
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={medianTimes}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 60, bottom: 35 }}
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
                            dataKey="problemId"
                            width={60}
                            style={{ fontSize: '0.8rem' }}
                            interval={0}
                        />
                        <Tooltip
                            formatter={(value: number) => [`${value.toFixed(2)}びょう`, 'かいとうじかん']}
                            labelFormatter={(label: string) => `もんだい: ${label}`}
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