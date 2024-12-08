// components/LearningHistory.tsx
import React from 'react';
import { useLearningHistory } from '../contexts/LearningHistoryContext';
import { ProblemType, ProblemTypeLabels } from '../types/mathProblems';

interface LearningHistoryProps {
    onClose: () => void;
}

export const LearningHistory: React.FC<LearningHistoryProps> = ({ onClose }) => {
    const { history, clearHistory } = useLearningHistory();

    // 日付をフォーマットする関数
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    // 問題種類ごとの統計を表示
    const renderProblemTypeStats = (type: ProblemType) => {
        const stats = history.problemTypeStats[type];
        const correctRate = stats.totalAttempts > 0
            ? (stats.correctAttempts / stats.totalAttempts * 100).toFixed(1)
            : '0.0';
        const averageTime = stats.totalAttempts > 0
            ? Math.round(stats.averageAnswerTime / 1000)
            : 0;

        return (
            <div key={type} className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="text-lg font-bold mb-2">{ProblemTypeLabels[type]}</h3>
                <div className="space-y-2 text-sm">
                    <p>といた もんだい: {stats.totalAttempts}もん</p>
                    <p>せいかいりつ: {correctRate}%</p>
                    <p>へいきん かいとうじかん: {averageTime}びょう</p>
                    {stats.lastAttemptDate && (
                        <p>さいごに といた ひ: {formatDate(stats.lastAttemptDate)}</p>
                    )}
                </div>
            </div>
        );
    };

    // 最近解いた問題の履歴を表示
    const renderRecentHistory = () => {
        const recentProblems = Object.values(history.problemHistories)
            .flatMap(history =>
                history.attempts.map(attempt => ({
                    problem: history.problem,
                    ...attempt
                }))
            )
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);

        return (
            <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="text-lg font-bold mb-2">さいきん といた もんだい</h3>
                <div className="space-y-2">
                    {recentProblems.map((record, index) => (
                        <div
                            key={index}
                            className={`p-2 rounded ${record.isCorrect ? 'bg-green-100' : 'bg-red-100'
                                }`}
                        >
                            <p className="text-sm">
                                {record.problem.num1} {record.problem.operator} {record.problem.num2} = {
                                    record.problem.operator === '+'
                                        ? record.problem.num1 + record.problem.num2
                                        : record.problem.num1 - record.problem.num2
                                }
                                {record.isCorrect ? ' ○' : ' ×'}
                            </p>
                            <p className="text-xs text-gray-600">
                                {formatDate(record.timestamp)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">がくしゅう きろく</h2>
                    <div className="space-x-2">
                        <button
                            onClick={clearHistory}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            きろくを けす
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            もどる
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(ProblemType).map(type => renderProblemTypeStats(type))}
                </div>

                {renderRecentHistory()}
            </div>
        </div>
    );
};