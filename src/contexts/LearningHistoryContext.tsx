// contexts/LearningHistoryContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    LearningHistory,
    AttemptRecord,
    ProblemHistory,
    ProblemTypeStats,
    LEARNING_HISTORY_STORAGE_KEY,
    generateProblemId
} from '../types/learningHistory';
import { MathProblem, ProblemType } from '../types/mathProblems';

// デフォルトの統計情報
const createDefaultProblemTypeStats = (): ProblemTypeStats => ({
    totalAttempts: 0,
    correctAttempts: 0,
    averageAnswerTime: 0,
    lastAttemptDate: null,
});

// デフォルトの学習履歴
const createDefaultLearningHistory = (): LearningHistory => ({
    problemHistories: {},
    problemTypeStats: {
        [ProblemType.AdditionNoCarry]: createDefaultProblemTypeStats(),
        [ProblemType.SubtractionNoBorrow]: createDefaultProblemTypeStats(),
        [ProblemType.AdditionWithCarry]: createDefaultProblemTypeStats(),
        [ProblemType.SubtractionWithBorrow]: createDefaultProblemTypeStats(),
    },
    lastUpdated: new Date().toISOString(),
});

interface LearningHistoryContextType {
    history: LearningHistory;
    recordAttempt: (
        problem: MathProblem,
        isCorrect: boolean,
        answeredTime: number
    ) => void;
    getProblemHistory: (problemId: string) => ProblemHistory | null;
    getProblemTypeStats: (type: ProblemType) => ProblemTypeStats;
    clearHistory: () => void;
}

const LearningHistoryContext = createContext<LearningHistoryContextType | null>(null);

export const useLearningHistory = () => {
    const context = useContext(LearningHistoryContext);
    if (!context) {
        throw new Error('useLearningHistory must be used within a LearningHistoryProvider');
    }
    return context;
};

interface LearningHistoryProviderProps {
    children: React.ReactNode;
}

export const LearningHistoryProvider: React.FC<LearningHistoryProviderProps> = ({ children }) => {
    const [history, setHistory] = useState<LearningHistory>(() => {
        // LocalStorageから学習履歴を読み込む
        const stored = localStorage.getItem(LEARNING_HISTORY_STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse learning history:', e);
            }
        }
        return createDefaultLearningHistory();
    });

    // 履歴が更新されたらLocalStorageに保存
    useEffect(() => {
        localStorage.setItem(LEARNING_HISTORY_STORAGE_KEY, JSON.stringify(history));
    }, [history]);

    // 問題の解答を記録
    /**
     * 問題の解答を記録する
     * @param problem 解答した問題
     * @param isCorrect 正解したかどうか
     * @param answeredTime 解答にかかった時間（ミリ秒）
     */
    const recordAttempt = (
        problem: MathProblem,
        isCorrect: boolean,
        answeredTime: number
    ) => {
        const problemId = generateProblemId(problem);
        const timestamp = new Date().toISOString();

        setHistory(prev => {
            // 新しい解答記録
            const newAttempt: AttemptRecord = {
                timestamp,
                isCorrect,
                answeredTime,
            };

            // 問題の履歴を更新
            const existingHistory = prev.problemHistories[problemId] || {
                problemId,
                problem: {
                    num1: problem.num1,
                    num2: problem.num2,
                    operator: problem.operator,
                    type: problem.type,
                },
                attempts: [],
            };

            const newProblemHistory: ProblemHistory = {
                ...existingHistory,
                attempts: [...existingHistory.attempts, newAttempt],
            };

            // 問題種類の統計を更新
            const typeStats = prev.problemTypeStats[problem.type];
            const newTypeStats: ProblemTypeStats = {
                totalAttempts: typeStats.totalAttempts + 1,
                correctAttempts: typeStats.correctAttempts + (isCorrect ? 1 : 0),
                averageAnswerTime:
                    (typeStats.averageAnswerTime * typeStats.totalAttempts + answeredTime) /
                    (typeStats.totalAttempts + 1),
                lastAttemptDate: timestamp,
            };

            return {
                problemHistories: {
                    ...prev.problemHistories,
                    [problemId]: newProblemHistory,
                },
                problemTypeStats: {
                    ...prev.problemTypeStats,
                    [problem.type]: newTypeStats,
                },
                lastUpdated: timestamp,
            };
        });
    };

    // 特定の問題の履歴を取得
    const getProblemHistory = (problemId: string): ProblemHistory | null => {
        return history.problemHistories[problemId] || null;
    };

    // 問題種類の統計を取得
    const getProblemTypeStats = (type: ProblemType): ProblemTypeStats => {
        return history.problemTypeStats[type];
    };

    // 履歴をクリア
    const clearHistory = () => {
        setHistory(createDefaultLearningHistory());
    };

    const value = {
        history,
        recordAttempt,
        getProblemHistory,
        getProblemTypeStats,
        clearHistory,
    };

    return (
        <LearningHistoryContext.Provider value={value}>
            {children}
        </LearningHistoryContext.Provider>
    );
};