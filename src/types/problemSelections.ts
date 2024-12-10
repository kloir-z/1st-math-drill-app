export interface ProblemScore {
    timeScore: number;
    accuracyScore: number;
    lastIncorrectScore?: number;
    distributionScore: number;
    repeatPenalty: number;
    totalScore: number;
}