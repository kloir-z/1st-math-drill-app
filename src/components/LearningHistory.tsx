// components/LearningHistory.tsx
import React from 'react';
import { useLearningHistory } from '../hooks/useLearningHistory';
import { ProblemType, ProblemTypeLabels } from '../types/mathProblems';

interface LearningHistoryProps {
    onClose: () => void;
}

export const LearningHistory: React.FC<LearningHistoryProps> = ({ onClose }) => {
    const { history, clearHistory } = useLearningHistory();

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

    interface ParsedProblem {
        num1: number;
        operator: '+' | '-';
        num2: number;
    }

    // 問題IDから数値と演算子を抽出する関数
    const parseProblemId = (problemId: string): ParsedProblem | null => {
        const match = problemId.match(/(\d+)([-+])(\d+)/);
        if (!match) return null;
        return {
            num1: parseInt(match[1]),
            operator: match[2] as '+' | '-',
            num2: parseInt(match[3])
        };
    };

    // 最近解いた問題の履歴を表示
    const renderRecentHistory = () => {
        const recentProblems = Object.entries(history.problemHistories)
            .flatMap(([problemId, history]) => {
                const parsed = parseProblemId(problemId);
                if (!parsed) return [];
                return history.attempts.map(attempt => ({
                    problemId,
                    ...parsed,
                    ...attempt
                }));
            })
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);

        return (
            <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="text-lg font-bold mb-2">さいきん といた もんだい</h3>
                <div className="space-y-2">
                    {recentProblems.map((record, index) => (
                        <div
                            key={index}
                            className={`p-2 rounded ${record.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}
                        >
                            <p className="text-sm">
                                {record.num1} {record.operator} {record.num2} = {
                                    record.operator === '+'
                                        ? record.num1 + record.num2
                                        : record.num1 - record.num2
                                }
                                {record.isCorrect ? ' ○' : ' ×'}
                                <span className="ml-2 text-gray-600">
                                    ({Math.round(record.answeredTime / 1000)}びょう)
                                </span>
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
        <div className="min-h-screen bg-gray-50 px-2 py-4 md:p-4">
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                    <h2 className="text-lg md:text-xl font-bold">がくしゅう きろく</h2>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={clearHistory}
                            className="px-3 py-2 md:px-4 md:py-2 bg-red-500 text-white text-sm md:text-base rounded-lg hover:bg-red-600 transition-colors"
                        >
                            きろくを けす
                        </button>
                        <button
                            onClick={onClose}
                            className="px-3 py-2 md:px-4 md:py-2 bg-gray-500 text-white text-sm md:text-base rounded-lg hover:bg-gray-600 transition-colors"
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