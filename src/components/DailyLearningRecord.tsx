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

    // 問題種類ごとの正解数を集計
    const correctProblemCounts = Object.fromEntries(
        Object.keys(dailyRecord.problemCounts).map(type => [type, 0])
    );

    // 不正解の問題をカウント
    const incorrectProblems = new Set(
        dailyRecord.incorrectProblems.map(problem =>
            `${problem.type}:${problem.num1}${problem.operator}${problem.num2}`
        )
    );

    // 正解数を計算（総数から不正解を引く）
    Object.entries(dailyRecord.problemCounts).forEach(([type, totalCount]) => {
        const incorrectCount = Array.from(incorrectProblems).filter(id =>
            id.startsWith(`${type}:`)
        ).length;
        correctProblemCounts[type] = totalCount - incorrectCount;
    });

    // 間違えた問題を集計
    const incorrectProblemCounts = dailyRecord.incorrectProblems.reduce((acc, problem) => {
        const key = `${problem.num1}${problem.operator}${problem.num2}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // ユニークな間違えた問題を取得
    const uniqueIncorrectProblems = Array.from(
        new Map(
            dailyRecord.incorrectProblems.map(problem =>
                [`${problem.num1}${problem.operator}${problem.num2}`, problem]
            )
        ).values()
    );

    return (
        <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-bold mb-4">きょうの きろく</h3>

            {/* 問題種類ごとの正解数 */}
            <div className="mb-4">
                <h4 className="font-bold mb-2">せいかいした もんだいの かず</h4>
                {Object.entries(correctProblemCounts).map(([type, count]) => {
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
                {uniqueIncorrectProblems.length > 0 ? (
                    <div className="space-y-2">
                        {uniqueIncorrectProblems.map((problem, index) => {
                            const problemKey = `${problem.num1}${problem.operator}${problem.num2}`;
                            const incorrectCount = incorrectProblemCounts[problemKey];
                            return (
                                <div key={index} className="bg-red-50 p-2 rounded">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-sm"
                                            style={{ backgroundColor: TYPE_COLORS[problem.type] }}
                                        />
                                        <div className="flex items-center justify-between w-full">
                                            <div>{formatProblem(problem)}</div>
                                            <div className="text-gray-600">
                                                {incorrectCount}かい
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>まちがえた もんだいは ありません</p>
                )}
            </div>
        </div>
    );
};