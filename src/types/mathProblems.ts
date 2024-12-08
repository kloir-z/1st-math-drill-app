export enum ProblemType {
    AdditionNoCarry = 'AdditionNoCarry',
    SubtractionNoBorrow = 'SubtractionNoBorrow',
    AdditionWithCarry = 'AdditionWithCarry',
    SubtractionWithBorrow = 'SubtractionWithBorrow'
}

// 演算子の型
export type Operator = '+' | '-';

// 個々の問題を表す型
export interface MathProblem {
    num1: number;
    num2: number;
    operator: Operator;
    type: ProblemType;
}

// 問題の種類の表示名を定義
export const ProblemTypeLabels: Record<ProblemType, string> = {
    [ProblemType.AdditionNoCarry]: 'くりあがりのない 足し算',
    [ProblemType.SubtractionNoBorrow]: 'くりさがりのない 引き算',
    [ProblemType.AdditionWithCarry]: 'くりあがりのある 足し算',
    [ProblemType.SubtractionWithBorrow]: 'くりさがりのある 引き算'
};