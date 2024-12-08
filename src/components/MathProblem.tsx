// components/MathProblem.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MathProblem as MathProblemType, ProblemType } from '../types/mathProblems';
import { allProblems, calculateAnswer } from '../data/mathProblems';
import { NumberPad } from './NumberPad';
import { useLearningHistory } from '../hooks/useLearningHistory';
import { generateProblemId } from '../types/learningHistory';

interface MathProblemProps {
  problemType: ProblemType;
  onBack: () => void;  // 戻るボタンのハンドラーを追加
}

export const MathProblem: React.FC<MathProblemProps> = ({ problemType, onBack }) => {
  const [currentProblem, setCurrentProblem] = useState<MathProblemType | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { recordAttempt, getProblemStats, getDailyCount } = useLearningHistory();
  const problemStartTime = useRef<number>(Date.now());

  // 問題選択のロジック
  const selectNextProblem = useCallback(() => {
    const problems = allProblems[problemType];

    // 各問題の解答回数を取得
    const problemCounts = problems.map(problem => ({
      problem,
      stats: getProblemStats(generateProblemId(problem))
    }));

    // 最小の解答回数を見つける
    const minCount = Math.min(...problemCounts.map(p => p.stats.attemptCount));

    // 最小解答回数の問題だけをフィルタリング
    const candidateProblems = problemCounts.filter(p => p.stats.attemptCount === minCount);

    // ランダムに1つ選択
    const selectedProblem = candidateProblems[Math.floor(Math.random() * candidateProblems.length)].problem;

    return selectedProblem;
  }, [problemType, getProblemStats]);

  // 日付をフォーマットする関数
  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}がつ${date.getDate()}にち`;
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
    }
  };

  const handleShowAnswer = () => {
    if (!currentProblem || isTransitioning) return;

    setIsAnswerVisible(true);
    const answeredTime = Date.now() - problemStartTime.current;
    recordAttempt(currentProblem, false, answeredTime);  // 答えを見た場合は不正解として記録
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
  const problemNumber = dailyCount.count + 1;  // カウントを1から始める

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-lg">
        {/* 戻るボタンと問題番号を横並びに */}
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

        {/* 答えを見るボタン */}
        <div className="mt-4">
          <button
            onClick={handleShowAnswer}
            className="w-full p-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 
              transition-colors disabled:bg-gray-300 select-none"
            disabled={isAnswerVisible || isCorrect === true}
          >
            こたえを みる
          </button>
        </div>
      </div>
    </div>
  );
};