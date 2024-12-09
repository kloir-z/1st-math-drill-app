import { useState } from 'react';
import { useLearningHistory } from '../hooks/useLearningHistory';
import { ProblemType, ProblemTypeLabels } from '../types/mathProblems';
import { DailyRecord, DailyProblemRecord } from '../types/learningHistory'; // 追加
import { ArrowLeft } from 'lucide-react';

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日(${weekday})`;
};

const formatTime = (ms: number): string => {
    return `${(ms / 1000).toFixed(1)}びょう`;
};

const formatProblem = (record: DailyProblemRecord): string => {
    return `${record.num1} ${record.operator} ${record.num2}`;
};

export default function PastRecords({ onClose }: { onClose: () => void }) {
    const { history } = useLearningHistory();
    const [expandedDate, setExpandedDate] = useState<string | null>(null);

    // 日付の降順でソート
    const sortedDates = Object.keys(history.dailyRecords).sort((a, b) => b.localeCompare(a));

    const handleDateClick = (date: string) => {
        setExpandedDate(expandedDate === date ? null : date);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center mb-6">
                    <button
                        onClick={onClose}
                        className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold">これまでの がくしゅうきろく</h2>
                </div>

                <div className="space-y-4">
                    {sortedDates.map((date) => {
                        const record: DailyRecord = history.dailyRecords[date];
                        const isExpanded = expandedDate === date;

                        return (
                            <div
                                key={date}
                                className="bg-white rounded-lg shadow-md overflow-hidden"
                            >
                                <button
                                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                                    onClick={() => handleDateClick(date)}
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold">{formatDate(date)}</h3>
                                        <span className="text-gray-600">
                                            {Object.values(record.problemCounts).reduce((a, b) => a + b, 0)}もん
                                        </span>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t">
                                        {/* 問題種類ごとの解答数 */}
                                        <div className="mt-4">
                                            <h4 className="font-bold mb-2">といた もんだいの かず</h4>
                                            {Object.entries(record.problemCounts)
                                                .filter(([, count]) => count > 0)
                                                .map(([type, count]) => (
                                                    <div key={type} className="flex justify-between mb-1">
                                                        <span>{ProblemTypeLabels[type as ProblemType]}:</span>
                                                        <span>{count}もん</span>
                                                    </div>
                                                ))}
                                        </div>

                                        {/* 間違えた問題 */}
                                        {record.incorrectProblems.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="font-bold mb-2">まちがえた もんだい</h4>
                                                <div className="space-y-2">
                                                    {record.incorrectProblems.map((problem, index) => (
                                                        <div key={index} className="bg-red-50 p-2 rounded">
                                                            <div>{formatProblem(problem)}</div>
                                                            <div className="text-sm text-gray-600">
                                                                かかったじかん: {formatTime(problem.answeredTime)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}