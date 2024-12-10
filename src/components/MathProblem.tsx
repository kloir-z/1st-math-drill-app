import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MathProblem as MathProblemType, ProblemType } from '../types/mathProblems';
import { allProblems, calculateAnswer } from '../data/mathProblems';
import { NumberPad } from './NumberPad';
import { useLearningHistory } from '../hooks/useLearningHistory';
import { generateProblemId } from '../types/learningHistory';

interface MathProblemProps {
  problemType: ProblemType;
  onBack: () => void;
}

const RECENT_PROBLEMS_COUNT = 5;
const DIFFICULT_PROBLEMS_COUNT = 5;
const DIFFICULT_PROBLEMS_WEIGHT = 0.4;

export const MathProblem: React.FC<MathProblemProps> = ({ problemType, onBack }) => {
  const [currentProblem, setCurrentProblem] = useState<MathProblemType | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [recentProblems, setRecentProblems] = useState<string[]>([]);

  const { recordAttempt, getProblemHistory, getProblemStats, getDailyCount } = useLearningHistory();
  const problemStartTime = useRef<number>(Date.now());

  const selectNextProblem = useCallback(() => {
    const getAverageAnswerTime = (problemId: string) => {
      const history = getProblemHistory(problemId);
      if (!history || history.attempts.length === 0) return 0;

      const validAttempts = history.attempts
        .filter(attempt => attempt.isCorrect)
        .map(attempt => attempt.answeredTime);

      if (validAttempts.length === 0) return 0;
      return validAttempts.reduce((sum, time) => sum + time, 0) / validAttempts.length;
    };

    const getDifficultProblems = (problems: MathProblemType[]) => {
      const problemsWithTimes = problems.map(problem => {
        const problemId = generateProblemId(problem);
        return {
          problem,
          averageTime: getAverageAnswerTime(problemId)
        };
      });

      return problemsWithTimes
        .filter(p => p.averageTime > 0)
        .sort((a, b) => b.averageTime - a.averageTime)
        .slice(0, DIFFICULT_PROBLEMS_COUNT)
        .map(p => p.problem);
    };

    const problems = allProblems[problemType];
    const difficultProblems = getDifficultProblems(problems);

    const shouldSelectDifficult =
      difficultProblems.length > 0 &&
      Math.random() < DIFFICULT_PROBLEMS_WEIGHT;

    const problemCounts = problems.map(problem => {
      const problemId = generateProblemId(problem);
      return {
        problem,
        problemId,
        stats: getProblemStats(problemId)
      };
    });

    let candidateProblems: MathProblemType[] = [];

    if (shouldSelectDifficult) {
      const nonRecentDifficult = difficultProblems.filter(
        problem => !recentProblems.includes(generateProblemId(problem))
      );
      if (nonRecentDifficult.length > 0) {
        candidateProblems = nonRecentDifficult;
      }
    }

    if (candidateProblems.length === 0) {
      const minCount = Math.min(...problemCounts.map(p => p.stats.attemptCount));
      const normalCandidates = problemCounts
        .filter(p => p.stats.attemptCount === minCount)
        .map(p => p.problem);

      const nonRecentNormal = normalCandidates.filter(
        problem => !recentProblems.includes(generateProblemId(problem))
      );

      candidateProblems = nonRecentNormal.length > 0 ? nonRecentNormal : normalCandidates;
    }

    const selectedProblem = candidateProblems[
      Math.floor(Math.random() * candidateProblems.length)
    ];

    const newProblemId = generateProblemId(selectedProblem);
    setRecentProblems(prev => {
      const updated = [newProblemId, ...prev.slice(0, RECENT_PROBLEMS_COUNT - 1)];
      return updated;
    });

    return selectedProblem;
  }, [problemType, getProblemHistory, getProblemStats, recentProblems]);

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日(${weekday})`;
  };

  const getNextProblem = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const nextProblem = selectNextProblem();
    setCurrentProblem(nextProblem);
    setUserInput('');
    setIsCorrect(null);
    setIsAnswerVisible(false);
    problemStartTime.current = Date.now();

    setIsTransitioning(false);
  }, [selectNextProblem, isTransitioning]);

  const handleNumberClick = (num: number) => {
    if (userInput.length < 2) {
      setUserInput(prev => prev + num.toString());
    }
  };

  const handleDelete = () => {
    setUserInput('');
  };

  const handleSubmit = () => {
    if (!currentProblem || !userInput || isTransitioning) return;

    const correctAnswer = calculateAnswer(currentProblem);
    const isAnswerCorrect = parseInt(userInput) === correctAnswer;
    setIsCorrect(isAnswerCorrect);

    const answeredTime = Date.now() - problemStartTime.current;
    recordAttempt(currentProblem, isAnswerCorrect, answeredTime);

    if (isAnswerCorrect) {
      setIsAnswerVisible(true);
      setTimeout(() => {
        getNextProblem();
      }, 1500);
    } else {
      setUserInput('');
    }
  };

  useEffect(() => {
    if (!currentProblem) {
      getNextProblem();
    }
  }, [problemType, getNextProblem, currentProblem]);

  if (!currentProblem) {
    return <div className="text-gray-800">Loading...</div>;
  }

  const dailyCount = getDailyCount(problemType);
  const today = new Date();
  const displayDate = formatDate(today);
  const problemNumber = dailyCount.count + 1;

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ←もどる
          </button>
          <div className="text-lg text-gray-600 select-none">
            {displayDate} {problemNumber}もんめ
          </div>
        </div>

        {/* 問題表示 */}
        <div className="text-5xl text-center font-bold mb-4 text-gray-800 select-none">
          {currentProblem.num1} {currentProblem.operator} {currentProblem.num2} =
          {isAnswerVisible || (isCorrect === true) ? calculateAnswer(currentProblem) : '?'}
        </div>

        {/* メッセージエリア */}
        <div className="h-12 flex items-center justify-center mb-4">
          {isCorrect !== null && (
            <div className={`text-2xl font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'} 
              transition-opacity duration-200 ease-in-out select-none`}>
              {isCorrect ? 'せいかい！' : 'ざんねん...'}
            </div>
          )}
        </div>

        {/* 数字キーパッド */}
        <NumberPad
          onNumberClick={handleNumberClick}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          currentInput={userInput}
        />

      </div>
    </div>
  );
};