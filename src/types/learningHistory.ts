import { MathProblem, Operator, ProblemType } from './mathProblems';

// 1回の解答の記録
export interface AttemptRecord {
    timestamp: string;  // ISO形式の日時文字列
    isCorrect: boolean;
    answeredTime: number;  // 解答にかかった時間（ミリ秒）
}

// 個別の問題に対する学習履歴
export interface ProblemHistory {
    problemId: string;  // "1+2"や"5-3"のような形式で問題を一意に特定
    attempts: AttemptRecord[];
}

// 問題種類ごとの統計情報
export interface ProblemTypeStats {
    totalAttempts: number;
    correctAttempts: number;
    averageAnswerTime: number;  // ミリ秒
    lastAttemptDate: string | null;  // ISO形式の日時文字列
}

export interface ProblemStats {
    attemptCount: number;
    lastAttempted: string | null;  // ISO形式の日時文字列
}

export interface DailyCount {
    date: string;  // YYYY-MM-DD形式
    count: number;
}

export interface DailyProblemRecord {
    problemId: string;
    type: ProblemType;
    timestamp: string;
    isCorrect: boolean;
    answeredTime: number;
    num1: number;
    num2: number;
    operator: Operator;
}

export interface DailyRecord {
    date: string;  // YYYY-MM-DD形式
    problemCounts: Record<ProblemType, number>;
    incorrectProblems: DailyProblemRecord[];
}

export interface LearningHistory {
    problemHistories: Record<string, ProblemHistory>;
    problemTypeStats: Record<ProblemType, ProblemTypeStats>;
    problemStats: Record<string, ProblemStats>;
    lastUpdated: string;
    dailyCounts: Record<ProblemType, DailyCount>;
    dailyRecords: Record<string, DailyRecord>;
    totalAttempts: Record<string, number>; // 問題ごとの総試行回数を記録
}

// LocalStorage用のキー
export const LEARNING_HISTORY_STORAGE_KEY = 'math-learning-history';

// 問題IDを生成するユーティリティ関数
export const generateProblemId = (problem: MathProblem): string => {
    return `${problem.num1}${problem.operator}${problem.num2}`;
};

// 最大解答時間（ミリ秒）
export const MAX_ANSWER_TIME = 300000; // 5分