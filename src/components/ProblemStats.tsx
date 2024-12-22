import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import _ from 'lodash';
import { useLearningHistory } from '../hooks/useLearningHistory';
import { ProblemType, ProblemTypeLabels } from '../types/mathProblems';
import { allProblems } from '../data/mathProblems';

interface ProblemTimeStats {
    problemId: string;
    medianTime: number;
    attemptCount: number;
    totalAttempts: number;
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

// 問題の解答セッションを特定する関数
const groupAttemptsIntoSessions = (attempts: Array<{ timestamp: string; isCorrect: boolean; answeredTime: number }>) => {
    const sessions: Array<Array<{ timestamp: string; isCorrect: boolean; answeredTime: number }>> = [];
    let currentSession: Array<{ timestamp: string; isCorrect: boolean; answeredTime: number }> = [];

    for (const attempt of attempts) {
        if (currentSession.length === 0 || !attempt.isCorrect) {
            currentSession.push(attempt);
        } else {
            // 正解の場合、新しいセッションを開始
            sessions.push(currentSession);
            currentSession = [attempt];
        }
    }

    if (currentSession.length > 0) {
        sessions.push(currentSession);
    }

    return sessions;
};

// セッションの合計時間を計算する関数
const calculateSessionTime = (session: Array<{ timestamp: string; isCorrect: boolean; answeredTime: number }>) => {
    // セッションの最後が正解でない場合はnullを返す
    if (!session[session.length - 1].isCorrect) {
        return null;
    }
    // セッション内の全試行の時間を合計
    return session.reduce((sum, attempt) => sum + attempt.answeredTime, 0);
};

export const ProblemStats = () => {
    const { history } = useLearningHistory();
    const [sortType, setSortType] = useState<SortType>('time');
    const [selectedType, setSelectedType] = useState<ProblemType | 'all'>('all');

    const calculateProblemStats = (): ProblemTimeStats[] => {
        let stats = Object.entries(history.problemHistories)
            .map(([problemId, problemHistory]) => {
                // セッションごとにグループ化
                const sessions = groupAttemptsIntoSessions(problemHistory.attempts);

                // 各セッションの合計時間を計算（正解で終わるセッションのみ）
                const sessionTimes = sessions
                    .map(calculateSessionTime)
                    .filter((time): time is number => time !== null);

                // 中央値を計算
                let medianTime;
                if (sessionTimes.length === 0) {
                    medianTime = 0;
                } else {
                    const sortedTimes = _.sortBy(sessionTimes);
                    medianTime = sessionTimes.length % 2 === 0
                        ? (sortedTimes[sessionTimes.length / 2 - 1] + sortedTimes[sessionTimes.length / 2]) / 2
                        : sortedTimes[Math.floor(sessionTimes.length / 2)];
                }

                // 問題の種類を特定
                let type: ProblemType = ProblemType.AdditionNoCarry;
                for (const [problemType, problems] of Object.entries(allProblems)) {
                    if (problems.some(p => `${p.num1}${p.operator}${p.num2}` === problemId)) {
                        type = problemType as ProblemType;
                        break;
                    }
                }

                // 総試行回数を取得
                const totalAttempts = history.totalAttempts[problemId] || 0;

                return {
                    problemId,
                    displayId: `${problemId} (${totalAttempts})`,
                    medianTime: Math.round(medianTime) / 1000, // ミリ秒から秒に変換
                    attemptCount: sessions.length,
                    totalAttempts,
                    type
                };
            })
            .filter(stat => stat.attemptCount > 0);

        if (selectedType !== 'all') {
            stats = stats.filter(stat => stat.type === selectedType);
        }

        if (sortType === 'time') {
            stats = _.orderBy(stats, 'medianTime', 'desc');
        } else {
            stats = _.sortBy(stats, ['type', 'problemId']);
        }

        return stats;
    };

    const problemStats = calculateProblemStats();
    const chartHeight = Math.max(40 * Math.max(problemStats.length, 1), 256);

    // 残りのコンポーネントのレンダリング部分は変更なし
    return (
        <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
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

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedType('all')}
                        className={`px-3 py-1 rounded text-sm ${selectedType === 'all'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        すべて
                    </button>
                    {Object.entries(ProblemTypeLabels).map(([type, label]) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type as ProblemType)}
                            className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${selectedType === type
                                ? 'text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            style={{
                                backgroundColor: selectedType === type
                                    ? TYPE_COLORS[type as ProblemType]
                                    : undefined
                            }}
                        >
                            <div
                                className="w-3 h-3 rounded-sm"
                                style={{ backgroundColor: TYPE_COLORS[type as ProblemType] }}
                            />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ height: `${chartHeight}px` }} className="w-full mt-4">
                {problemStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={problemStats}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 0, bottom: 35 }}
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
                                tick={{ fontSize: 14 }}
                                interval={0}
                                width={80}
                            />
                            <Tooltip
                                formatter={(value: number) => [`${value.toFixed(2)}びょう`, 'かいとうじかん']}
                                labelFormatter={(label: string) => {
                                    const [problemId, attempts] = label.split(' ');
                                    return `もんだい: ${problemId}\nかいすう: ${attempts}`;
                                }}
                                contentStyle={{ fontSize: '0.875rem' }}
                            />
                            <Bar dataKey="medianTime" name="medianTime" barSize={20}>
                                {problemStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.type]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        まだ データが ありません
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProblemStats;