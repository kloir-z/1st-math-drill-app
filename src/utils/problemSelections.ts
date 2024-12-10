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

    // 問題の実施回数を取得
    private getAttemptCount(problemId: string): number {
        return this.problemHistories[problemId]?.attempts.length || 0;
    }

    // 過去N回の試行を取得
    private getRecentAttempts(problemId: string, count: number) {
        const history = this.problemHistories[problemId];
        if (!history) return [];
        return history.attempts.slice(-count);
    }

    // 過去15回以内で間違えた問題かつ、その後正解していない問題かを判定
    private isRecentlyFailedProblem(problemId: string): boolean {
        const recentAttempts = this.getRecentAttempts(problemId, 15);
        if (recentAttempts.length === 0) return false;

        // 最後の不正解のインデックスを見つける
        const lastFailureIndex = recentAttempts
            .map(a => a.isCorrect)
            .lastIndexOf(false);

        // 不正解がない、または最後の試行が不正解の場合
        if (lastFailureIndex === -1) return false;

        // 不正解の後に正解があるかチェック
        return !recentAttempts.slice(lastFailureIndex + 1).some(a => a.isCorrect);
    }

    // 過去30回の中で時間を要したトップ3の問題かつ、改善していない問題かを判定
    private isSlowProblem(problemId: string): boolean {
        const recentAttempts = this.getRecentAttempts(problemId, 30);
        if (recentAttempts.length < 3) return false;

        // 過去30回の平均時間を計算
        const avgTime = recentAttempts.reduce((sum, a) => sum + a.answeredTime, 0) / recentAttempts.length;

        // 最新の解答時間
        const latestTime = recentAttempts[recentAttempts.length - 1].answeredTime;

        // 改善していれば除外
        if (latestTime <= avgTime) return false;

        // 全問題の平均解答時間でソートしたときのこの問題の位置を確認
        const allProblemAvgTimes = Object.keys(this.problemHistories).map(id => {
            const attempts = this.getRecentAttempts(id, 30);
            if (attempts.length === 0) return { id, avgTime: 0 };
            return {
                id,
                avgTime: attempts.reduce((sum, a) => sum + a.answeredTime, 0) / attempts.length
            };
        });

        allProblemAvgTimes.sort((a, b) => b.avgTime - a.avgTime);
        const rank = allProblemAvgTimes.findIndex(p => p.id === problemId);

        return rank < 3; // トップ3に入っているか
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

        // 問題を3つのグループに分類
        const priorityProblems: MathProblem[] = [];
        const normalProblems: MathProblem[] = [];

        for (const problem of availableProblems) {
            const problemId = generateProblemId(problem);
            if (this.isRecentlyFailedProblem(problemId) || this.isSlowProblem(problemId)) {
                priorityProblems.push(problem);
            } else {
                normalProblems.push(problem);
            }
        }

        // 優先問題から30%の確率で出題
        if (priorityProblems.length > 0 && Math.random() < 0.3) {
            const index = Math.floor(Math.random() * priorityProblems.length);
            const selectedProblem = priorityProblems[index];
            this.updateRecentProblems(selectedProblem);
            return selectedProblem;
        }

        // 通常問題を実施回数でソート
        normalProblems.sort((a, b) =>
            this.getAttemptCount(generateProblemId(a)) -
            this.getAttemptCount(generateProblemId(b))
        );

        // 最も実施回数の少ない問題グループから選択
        const minAttempts = this.getAttemptCount(generateProblemId(normalProblems[0]));
        const leastAttemptedProblems = normalProblems.filter(p =>
            this.getAttemptCount(generateProblemId(p)) === minAttempts
        );

        const selectedProblem = leastAttemptedProblems[
            Math.floor(Math.random() * leastAttemptedProblems.length)
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