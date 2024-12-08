// types/learningHistory.ts

import { MathProblem, ProblemType } from './mathProblems';

// 1回の解答の記録
export interface AttemptRecord {
    timestamp: string;  // ISO形式の日時文字列
    isCorrect: boolean;
    answeredTime: number;  // 解答にかかった時間（ミリ秒）
}

// 個別の問題に対する学習履歴
export interface ProblemHistory {
    problemId: string;  // "1+2"や"5-3"のような形式で問題を一意に特定
    problem: {
        num1: number;
        num2: number;
        operator: '+' | '-';
        type: ProblemType;
    };
    attempts: AttemptRecord[];
}

// 問題種類ごとの統計情報
export interface ProblemTypeStats {
    totalAttempts: number;
    correctAttempts: number;
    averageAnswerTime: number;  // ミリ秒
    lastAttemptDate: string | null;  // ISO形式の日時文字列
}

// 全体の学習履歴データ構造
export interface LearningHistory {
    problemHistories: Record<string, ProblemHistory>;  // problemIdをキーとする
    problemTypeStats: Record<ProblemType, ProblemTypeStats>;
    lastUpdated: string;  // ISO形式の日時文字列
}

// LocalStorage用のキー
export const LEARNING_HISTORY_STORAGE_KEY = 'math-learning-history';

// 問題IDを生成するユーティリティ関数
export const generateProblemId = (problem: MathProblem): string => {
    return `${problem.num1}${problem.operator}${problem.num2}`;
};