// components/LearningHistoryProvider.tsx
import React, { useEffect, useState } from 'react';
import {
    LearningHistory,
    AttemptRecord,
    ProblemHistory,
    ProblemTypeStats,
    ProblemStats,
    DailyCount,
    LEARNING_HISTORY_STORAGE_KEY,
    generateProblemId,
    MAX_ANSWER_TIME
} from '../types/learningHistory';
import { MathProblem, ProblemType } from '../types/mathProblems';
import { LearningHistoryContext } from '../contexts/LearningHistoryContext';

const createDefaultProblemTypeStats = (): ProblemTypeStats => ({
    totalAttempts: 0,
    correctAttempts: 0,
    averageAnswerTime: 0,
    lastAttemptDate: null,
});

const createDefaultDailyCount = (today: string): DailyCount => ({
    date: today,
    count: 0
});

const createDefaultLearningHistory = (): LearningHistory => {
    const today = new Date().toISOString().split('T')[0];
    return {
        problemHistories: {},
        problemTypeStats: {
            [ProblemType.AdditionNoCarry]: createDefaultProblemTypeStats(),
            [ProblemType.SubtractionNoBorrow]: createDefaultProblemTypeStats(),
            [ProblemType.AdditionWithCarry]: createDefaultProblemTypeStats(),
            [ProblemType.SubtractionWithBorrow]: createDefaultProblemTypeStats(),
        },
        problemStats: {},
        lastUpdated: new Date().toISOString(),
        dailyCounts: {
            [ProblemType.AdditionNoCarry]: createDefaultDailyCount(today),
            [ProblemType.SubtractionNoBorrow]: createDefaultDailyCount(today),
            [ProblemType.AdditionWithCarry]: createDefaultDailyCount(today),
            [ProblemType.SubtractionWithBorrow]: createDefaultDailyCount(today),
        }
    };
};

export const LearningHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [history, setHistory] = useState<LearningHistory>(() => {
        const stored = localStorage.getItem(LEARNING_HISTORY_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // 日付が変わっていたら dailyCounts をリセット
                const today = new Date().toISOString().split('T')[0];
                if (parsed.dailyCounts[ProblemType.AdditionNoCarry].date !== today) {
                    Object.keys(parsed.dailyCounts).forEach(type => {
                        parsed.dailyCounts[type] = createDefaultDailyCount(today);
                    });
                }
                return parsed;
            } catch (e) {
                console.error('Failed to parse learning history:', e);
            }
        }
        return createDefaultLearningHistory();
    });

    useEffect(() => {
        localStorage.setItem(LEARNING_HISTORY_STORAGE_KEY, JSON.stringify(history));
    }, [history]);

    const recordAttempt = (
        problem: MathProblem,
        isCorrect: boolean,
        answeredTime: number
    ) => {
        const problemId = generateProblemId(problem);
        const timestamp = new Date().toISOString();
        const today = timestamp.split('T')[0];

        const cappedAnsweredTime = Math.min(answeredTime, MAX_ANSWER_TIME);

        setHistory(prev => {
            // 問題タイプごとのdailyCountを更新
            const prevCount = prev.dailyCounts[problem.type];
            const newDailyCount = prevCount.date === today
                ? {
                    date: today,
                    count: isCorrect ? prevCount.count + 1 : prevCount.count
                }
                : createDefaultDailyCount(today);

            const newAttempt: AttemptRecord = {
                timestamp,
                isCorrect,
                answeredTime: cappedAnsweredTime,
            };

            const existingHistory = prev.problemHistories[problemId] || {
                problemId,
                attempts: [],
            };

            const existingStats = prev.problemStats[problemId] || {
                attemptCount: 0,
                lastAttempted: null
            };

            const newProblemStats: ProblemStats = {
                attemptCount: existingStats.attemptCount + 1,
                lastAttempted: timestamp
            };

            const typeStats = prev.problemTypeStats[problem.type];
            const newTypeStats: ProblemTypeStats = {
                totalAttempts: typeStats.totalAttempts + 1,
                correctAttempts: typeStats.correctAttempts + (isCorrect ? 1 : 0),
                averageAnswerTime:
                    (typeStats.averageAnswerTime * typeStats.totalAttempts + cappedAnsweredTime) /
                    (typeStats.totalAttempts + 1),
                lastAttemptDate: timestamp,
            };

            return {
                ...prev,
                problemHistories: {
                    ...prev.problemHistories,
                    [problemId]: {
                        ...existingHistory,
                        attempts: [...existingHistory.attempts, newAttempt],
                    },
                },
                problemTypeStats: {
                    ...prev.problemTypeStats,
                    [problem.type]: newTypeStats,
                },
                problemStats: {
                    ...prev.problemStats,
                    [problemId]: newProblemStats,
                },
                lastUpdated: timestamp,
                dailyCounts: {
                    ...prev.dailyCounts,
                    [problem.type]: newDailyCount,
                }
            };
        });
    };

    const getProblemHistory = (problemId: string): ProblemHistory | null => {
        return history.problemHistories[problemId] || null;
    };

    const getProblemTypeStats = (type: ProblemType): ProblemTypeStats => {
        return history.problemTypeStats[type];
    };

    const getProblemStats = (problemId: string): ProblemStats => {
        return history.problemStats[problemId] || { attemptCount: 0, lastAttempted: null };
    };

    const getDailyCount = (type: ProblemType): DailyCount => {
        return history.dailyCounts[type];
    };

    const clearHistory = () => {
        setHistory(createDefaultLearningHistory());
    };

    const value = {
        history,
        recordAttempt,
        getProblemHistory,
        getProblemTypeStats,
        getProblemStats,
        getDailyCount,
        clearHistory,
    };

    return (
        <LearningHistoryContext.Provider value={value}>
            {children}
        </LearningHistoryContext.Provider>
    );
};