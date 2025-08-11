// contexts/LearningHistoryContext.ts
import { createContext } from 'react';
import {
    LearningHistory,
    ProblemHistory,
    ProblemTypeStats,
    ProblemStats,
    DailyCount
} from '../types/learningHistory';
import { MathProblem, ProblemType } from '../types/mathProblems';

export interface LearningHistoryContextType {
    history: LearningHistory;
    recordAttempt: (
        problem: MathProblem,
        isCorrect: boolean,
        answeredTime: number,
        currentProblemType: ProblemType
    ) => void;
    getProblemHistory: (problemId: string) => ProblemHistory | null;
    getProblemTypeStats: (type: ProblemType) => ProblemTypeStats;
    getProblemStats: (problemId: string) => ProblemStats;
    getDailyCount: (type: ProblemType) => DailyCount;
    clearHistory: () => void;
}

export const LearningHistoryContext = createContext<LearningHistoryContextType | null>(null);