import React, { useState } from 'react';
import { useLearningHistory } from '../hooks/useLearningHistory';
import { DailyProblemRecord } from '../types/learningHistory';
import { ProblemType, ProblemTypeLabels } from '../types/mathProblems';
import { getJSTDateString } from '../utils/dateUtils';

const TYPE_COLORS = {
    [ProblemType.AdditionNoCarry]: '#3b82f6',      // blue
    [ProblemType.SubtractionNoBorrow]: '#ef4444',   // red
    [ProblemType.AdditionWithCarry]: '#22c55e',     // green
    [ProblemType.SubtractionWithBorrow]: '#f59e0b', // amber
};

export const DailyLearningRecord: React.FC = () => {
    const { history } = useLearningHistory();
    const [selectedDate,] = useState<string>(getJSTDateString());

    const formatTime = (ms: number) => {
        return `${(ms / 1000).toFixed(1)}びょう`;
    };

    const formatProblem = (record: DailyProblemRecord) => {
        return `${record.num1} ${record.operator} ${record.num2}`;
    };

    const dailyRecord = history.dailyRecords[selectedDate];

    if (!dailyRecord) {
        return (
            <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="text-lg font-bold mb-2">きょうの きろく</h3>
                <p>まだ きろくが ありません</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-bold mb-4">きょうの きろく</h3>

            {/* 問題種類ごとの解答数 */}
            <div className="mb-4">
                <h4 className="font-bold mb-2">といた もんだいの かず</h4>
                {Object.entries(dailyRecord.problemCounts).map(([type, count]) => {
                    const problemType = type as ProblemType;
                    return (
                        <div key={type} className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-sm"
                                    style={{ backgroundColor: TYPE_COLORS[problemType] }}
                                />
                                <span>{ProblemTypeLabels[problemType]}:</span>
                            </div>
                            <span>{count}もん</span>
                        </div>
                    );
                })}
            </div>

            {/* 間違えた問題 */}
            <div className="mb-4">
                <h4 className="font-bold mb-2">まちがえた もんだい</h4>
                {dailyRecord.incorrectProblems.length > 0 ? (
                    <div className="space-y-2">
                        {dailyRecord.incorrectProblems.map((problem, index) => (
                            <div key={index} className="bg-red-50 p-2 rounded">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-sm"
                                        style={{ backgroundColor: TYPE_COLORS[problem.type] }}
                                    />
                                    <div>{formatProblem(problem)}</div>
                                </div>
                                <div className="text-sm text-gray-600 ml-5">
                                    かかったじかん: {formatTime(problem.answeredTime)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>まちがえた もんだいは ありません</p>
                )}
            </div>
        </div>
    );
};