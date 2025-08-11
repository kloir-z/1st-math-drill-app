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
    MAX_ANSWER_TIME,
    DailyProblemRecord
} from '../types/learningHistory';
import { MathProblem, ProblemType } from '../types/mathProblems';
import { LearningHistoryContext } from '../contexts/LearningHistoryContext';

const MAX_HISTORY_PER_PROBLEM = 30;

const createDefaultProblemTypeStats = (): ProblemTypeStats => ({
    totalAttempts: 0,
    correctAttempts: 0,
    averageAnswerTime: 0,
    lastAttemptDate: null,
});

const getJapanDate = (): string => {
    const now = new Date();
    const jpTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    return jpTime.toISOString().split('T')[0];
};

const createDefaultDailyCount = (today: string): DailyCount => ({
    date: today,
    count: 0
});

const createDefaultLearningHistory = (): LearningHistory => {
    const today = getJapanDate();
    return {
        problemHistories: {},
        problemTypeStats: {
            [ProblemType.AdditionNoCarry]: createDefaultProblemTypeStats(),
            [ProblemType.SubtractionNoBorrow]: createDefaultProblemTypeStats(),
            [ProblemType.AdditionWithCarry]: createDefaultProblemTypeStats(),
            [ProblemType.SubtractionWithBorrow]: createDefaultProblemTypeStats(),
            [ProblemType.MixedReview]: createDefaultProblemTypeStats(),
        },
        problemStats: {},
        lastUpdated: new Date().toISOString(),
        dailyCounts: {
            [ProblemType.AdditionNoCarry]: createDefaultDailyCount(today),
            [ProblemType.SubtractionNoBorrow]: createDefaultDailyCount(today),
            [ProblemType.AdditionWithCarry]: createDefaultDailyCount(today),
            [ProblemType.SubtractionWithBorrow]: createDefaultDailyCount(today),
            [ProblemType.MixedReview]: createDefaultDailyCount(today),
        },
        dailyRecords: {},
        totalAttempts: {} 
    };
};

export const LearningHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [history, setHistory] = useState<LearningHistory>(() => {
        const stored = localStorage.getItem(LEARNING_HISTORY_STORAGE_KEY);
        if (stored) {
            try {
                const parsed: LearningHistory = JSON.parse(stored);
                const today = getJapanDate();
                if (parsed.dailyCounts[ProblemType.AdditionNoCarry].date !== today) {
                    Object.values(ProblemType).forEach((type: ProblemType) => {
                        parsed.dailyCounts[type] = createDefaultDailyCount(today);
                    });
                }
                if (!parsed.totalAttempts) {
                    parsed.totalAttempts = {};
                    Object.entries(parsed.problemHistories).forEach(([problemId, history]) => {
                        parsed.totalAttempts[problemId] = history.attempts.length;
                    });
                }
                return parsed;
            } catch (e) {
                console.error('Failed to parse learning history:', e);
                return createDefaultLearningHistory();
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
        const today = getJapanDate();

        const cappedAnsweredTime = Math.min(answeredTime, MAX_ANSWER_TIME);

        setHistory(prev => {
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

            const updatedAttempts = [...existingHistory.attempts, newAttempt]
                .slice(-MAX_HISTORY_PER_PROBLEM);

            const currentTotalAttempts = (prev.totalAttempts[problemId] || 0) + 1;

            const existingStats = prev.problemStats[problemId] || {
                attemptCount: 0,
                lastAttempted: null
            };

            const currentDailyRecord = prev.dailyRecords[today] || {
                date: today,
                problemCounts: Object.values(ProblemType).reduce((acc, type) => ({
                    ...acc,
                    [type]: 0
                }), {}),
                incorrectProblems: [],
            };

            const newProblemCounts = {
                ...currentDailyRecord.problemCounts,
                [problem.type]: (currentDailyRecord.problemCounts[problem.type] || 0) + 1
            };

            const problemRecord: DailyProblemRecord = {
                problemId,
                type: problem.type,
                timestamp,
                isCorrect,
                answeredTime: cappedAnsweredTime,
                num1: problem.num1,
                num2: problem.num2,
                operator: problem.operator
            };

            const newTypeStats = {
                ...prev.problemTypeStats[problem.type],
                totalAttempts: prev.problemTypeStats[problem.type].totalAttempts + 1,
                correctAttempts: prev.problemTypeStats[problem.type].correctAttempts + (isCorrect ? 1 : 0),
                averageAnswerTime:
                    (prev.problemTypeStats[problem.type].averageAnswerTime * prev.problemTypeStats[problem.type].totalAttempts + cappedAnsweredTime) /
                    (prev.problemTypeStats[problem.type].totalAttempts + 1),
                lastAttemptDate: timestamp,
            };

            const newIncorrectProblems = [...currentDailyRecord.incorrectProblems];
            if (!isCorrect) {
                newIncorrectProblems.push(problemRecord);
            }

            return {
                ...prev,
                problemHistories: {
                    ...prev.problemHistories,
                    [problemId]: {
                        ...existingHistory,
                        attempts: updatedAttempts,
                    },
                },
                problemTypeStats: {
                    ...prev.problemTypeStats,
                    [problem.type]: newTypeStats,
                },
                problemStats: {
                    ...prev.problemStats,
                    [problemId]: {
                        attemptCount: existingStats.attemptCount + 1,
                        lastAttempted: timestamp
                    },
                },
                lastUpdated: timestamp,
                dailyCounts: {
                    ...prev.dailyCounts,
                    [problem.type]: newDailyCount,
                },
                dailyRecords: {
                    ...prev.dailyRecords,
                    [today]: {
                        date: today,
                        problemCounts: newProblemCounts,
                        incorrectProblems: newIncorrectProblems,
                    }
                },
                totalAttempts: {
                    ...prev.totalAttempts,
                    [problemId]: currentTotalAttempts
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

    const getTotalAttempts = (problemId: string): number => {
        return history.totalAttempts[problemId] || 0;
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
        getTotalAttempts,
        getDailyCount,
        clearHistory,
    };

    return (
        <LearningHistoryContext.Provider value={value}>
            {children}
        </LearningHistoryContext.Provider>
    );
};