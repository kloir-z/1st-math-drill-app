import { MathProblem } from '../types/mathProblems';
import { ProblemHistory, generateProblemId } from '../types/learningHistory';
import { ProblemScore } from '../types/problemSelections';

const RECENT_ATTEMPTS_COUNT = 5;
const TIME_WEIGHT = 0.3;
const ACCURACY_WEIGHT = 0.4;
const LAST_INCORRECT_WEIGHT = 0.3;
const DECAY_FACTOR = 0.1; // 時間経過による減衰係数
const DEFAULT_ACCURACY = 0.5;
const RANDOM_FACTOR_RANGE = 0.4; // ±20%のランダム性

export class ProblemSelector {
    private recentProblems: string[] = [];
    private problemHistories: Record<string, ProblemHistory>;
    private currentSessionCorrectCount = 0;
    private currentSessionTotalCount = 0;

    constructor(problemHistories: Record<string, ProblemHistory>) {
        this.problemHistories = problemHistories;
    }

    // 回答時間のスコアを計算
    private calculateTimeScore(problemId: string): number {
        const history = this.problemHistories[problemId];
        if (!history || history.attempts.length === 0) return 0.5;

        const recentAttempts = history.attempts
            .slice(-RECENT_ATTEMPTS_COUNT)
            .filter(attempt => attempt.isCorrect);

        if (recentAttempts.length === 0) return 0.5;

        const avgTime = recentAttempts.reduce((sum, att) => sum + att.answeredTime, 0) / recentAttempts.length;
        // 20秒を基準として正規化（20秒で0.5のスコア）
        return Math.min(avgTime / 20000, 1);
    }

    // 正答率のスコアを計算
    private calculateAccuracyScore(problemId: string): number {
        const history = this.problemHistories[problemId];
        if (!history || history.attempts.length === 0) return DEFAULT_ACCURACY;

        const recentAttempts = history.attempts.slice(-RECENT_ATTEMPTS_COUNT);
        const correctCount = recentAttempts.filter(att => att.isCorrect).length;
        return 1 - (correctCount / recentAttempts.length);
    }

    // 最後の不正解からの経過時間スコアを計算
    private calculateLastIncorrectScore(problemId: string): number {
        const history = this.problemHistories[problemId];
        if (!history || history.attempts.length === 0) return 0.5;

        const lastIncorrect = [...history.attempts]
            .reverse()
            .find(att => !att.isCorrect);

        if (!lastIncorrect) return 0;

        const hoursSinceLastIncorrect =
            (Date.now() - new Date(lastIncorrect.timestamp).getTime()) / (1000 * 60 * 60);

        return Math.exp(-DECAY_FACTOR * hoursSinceLastIncorrect);
    }

    // セッションの正答率に基づいて重みを調整
    private getAdjustedWeights(): { timeWeight: number; accuracyWeight: number; lastIncorrectWeight: number } {
        if (this.currentSessionTotalCount < 5) {
            return {
                timeWeight: TIME_WEIGHT,
                accuracyWeight: ACCURACY_WEIGHT,
                lastIncorrectWeight: LAST_INCORRECT_WEIGHT
            };
        }

        const sessionAccuracy = this.currentSessionCorrectCount / this.currentSessionTotalCount;
        if (sessionAccuracy > 0.8) {
            // 正答率が高い場合は時間の重みを増やす
            return {
                timeWeight: TIME_WEIGHT * 1.5,
                accuracyWeight: ACCURACY_WEIGHT * 0.7,
                lastIncorrectWeight: LAST_INCORRECT_WEIGHT * 0.8
            };
        } else if (sessionAccuracy < 0.6) {
            // 正答率が低い場合は正答率の重みを増やす
            return {
                timeWeight: TIME_WEIGHT * 0.7,
                accuracyWeight: ACCURACY_WEIGHT * 1.5,
                lastIncorrectWeight: LAST_INCORRECT_WEIGHT * 0.8
            };
        }

        return {
            timeWeight: TIME_WEIGHT,
            accuracyWeight: ACCURACY_WEIGHT,
            lastIncorrectWeight: LAST_INCORRECT_WEIGHT
        };
    }

    // 問題の総合スコアを計算
    private calculateProblemScore(problemId: string): ProblemScore {
        const timeScore = this.calculateTimeScore(problemId);
        const accuracyScore = this.calculateAccuracyScore(problemId);
        const lastIncorrectScore = this.calculateLastIncorrectScore(problemId);

        const weights = this.getAdjustedWeights();
        const baseScore =
            timeScore * weights.timeWeight +
            accuracyScore * weights.accuracyWeight +
            lastIncorrectScore * weights.lastIncorrectWeight;

        // ランダム係数を適用
        const randomFactor = 1 + (Math.random() * RANDOM_FACTOR_RANGE - RANDOM_FACTOR_RANGE / 2);
        const totalScore = baseScore * randomFactor;

        return {
            timeScore,
            accuracyScore,
            lastIncorrectScore,
            totalScore
        };
    }

    // 次の問題を選択
    selectNextProblem(problems: MathProblem[]): MathProblem {
        const availableProblems = problems.filter(problem =>
            !this.recentProblems.includes(generateProblemId(problem))
        );

        // スコア付けとソート
        const scoredProblems = availableProblems.map(problem => {
            const problemId = generateProblemId(problem);
            return {
                problem,
                score: this.calculateProblemScore(problemId)
            };
        });

        // スコアで降順ソート
        scoredProblems.sort((a, b) => b.score.totalScore - a.score.totalScore);

        // 上位3問からランダムに1問選択
        const topProblems = scoredProblems.slice(0, 3);
        const selectedProblem =
            topProblems[Math.floor(Math.random() * topProblems.length)].problem;

        // 履歴を更新
        const selectedProblemId = generateProblemId(selectedProblem);
        this.recentProblems = [selectedProblemId, ...this.recentProblems].slice(0, 5);

        return selectedProblem;
    }

    // 解答結果を記録
    recordAttempt(isCorrect: boolean): void {
        this.currentSessionTotalCount++;
        if (isCorrect) {
            this.currentSessionCorrectCount++;
        }
    }

    // セッション情報をリセット
    resetSession(): void {
        this.currentSessionCorrectCount = 0;
        this.currentSessionTotalCount = 0;
    }
}
