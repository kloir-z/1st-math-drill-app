import { MathProblem } from '../types/mathProblems';
import { ProblemHistory, generateProblemId } from '../types/learningHistory';

export class ProblemSelector {
    private recentProblems: string[] = [];
    private problemHistories: Record<string, ProblemHistory>;
    private currentSessionCorrectCount = 0;
    private currentSessionTotalCount = 0;

    constructor(problemHistories: Record<string, ProblemHistory>) {
        this.problemHistories = problemHistories;
    }

    // 問題の正解回数を取得
    private getCorrectCount(problemId: string): number {
        const history = this.problemHistories[problemId];
        if (!history) return 0;
        return history.attempts.filter(attempt => attempt.isCorrect).length;
    }

    selectNextProblem(problems: MathProblem[]): MathProblem {
        // 直近5問を除外
        const availableProblems = problems.filter(p =>
            !this.recentProblems.includes(generateProblemId(p))
        );

        if (availableProblems.length === 0) {
            // 全ての問題が直近5問に含まれている場合は、全問題から選択
            const randomIndex = Math.floor(Math.random() * problems.length);
            return problems[randomIndex];
        }

        // 各問題の正解回数を取得
        const problemsWithCorrectCount = availableProblems.map(problem => ({
            problem,
            correctCount: this.getCorrectCount(generateProblemId(problem))
        }));

        // 最も正解回数が少ない回数を見つける
        const minCorrectCount = Math.min(...problemsWithCorrectCount.map(p => p.correctCount));

        // 正解回数が最少の問題をフィルタリング
        const leastCorrectProblems = problemsWithCorrectCount
            .filter(p => p.correctCount === minCorrectCount)
            .map(p => p.problem);

        // その中からランダムに1問選択
        const selectedProblem = leastCorrectProblems[
            Math.floor(Math.random() * leastCorrectProblems.length)
        ];

        this.updateRecentProblems(selectedProblem);
        return selectedProblem;
    }

    private updateRecentProblems(problem: MathProblem): void {
        const problemId = generateProblemId(problem);
        this.recentProblems = [problemId, ...this.recentProblems].slice(0, 5);
    }

    // 解答結果を記録するメソッド（既存コードとの互換性のために追加）
    recordAttempt(isCorrect: boolean): void {
        this.currentSessionTotalCount++;
        if (isCorrect) {
            this.currentSessionCorrectCount++;
        }
    }

    // セッション情報をリセット
    resetSession(): void {
        this.recentProblems = [];
        this.currentSessionCorrectCount = 0;
        this.currentSessionTotalCount = 0;
    }
}