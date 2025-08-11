import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MathProblem as MathProblemType, ProblemType } from '../types/mathProblems';
import { allProblems, calculateAnswer } from '../data/mathProblems';
import { NumberPad } from './NumberPad';
import { useLearningHistory } from '../hooks/useLearningHistory';
import { ProblemSelector } from '../utils/problemSelections';
import { ArrowLeft } from 'lucide-react';

interface MathProblemProps {
  problemType: ProblemType;
  onBack: () => void;
}

export const MathProblem: React.FC<MathProblemProps> = ({ problemType, onBack }) => {
  const [currentProblem, setCurrentProblem] = useState<MathProblemType | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAnswerProcessed, setIsAnswerProcessed] = useState(false);

  const { recordAttempt, getDailyCount, history } = useLearningHistory();
  const problemStartTime = useRef<number>(Date.now());
  const problemSelector = useRef<ProblemSelector | null>(null);
  const nextProblemTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日(${weekday})`;
  };

  useEffect(() => {
    problemSelector.current = new ProblemSelector(history.problemHistories);
    return () => {
      if (problemSelector.current) {
        problemSelector.current.resetSession();
      }
    };
  }, [history]);

  const getNextProblem = useCallback(() => {
    if (isTransitioning || !problemSelector.current) return;
    setIsTransitioning(true);
    
    // 既存のタイマーがあればクリア
    if (nextProblemTimeoutRef.current) {
      clearTimeout(nextProblemTimeoutRef.current);
      nextProblemTimeoutRef.current = null;
    }

    const problems = allProblems[problemType];
    const nextProblem = problemSelector.current.selectNextProblem(problems);

    setCurrentProblem(nextProblem);
    setUserInput('');
    setIsCorrect(null);
    setIsAnswerVisible(false);
    setIsAnswerProcessed(false);
    problemStartTime.current = Date.now();

    // 状態更新が完了するまで少し待ってからisTransitioningをfalseにする
    setTimeout(() => {
      setIsTransitioning(false);
    }, 50);
  }, [problemType, isTransitioning]);

  const handleSubmit = useCallback(() => {
    if (!currentProblem || !userInput || isTransitioning || isAnswerProcessed) return;

    const correctAnswer = calculateAnswer(currentProblem);
    const isAnswerCorrect = parseInt(userInput) === correctAnswer;
    setIsCorrect(isAnswerCorrect);
    setIsAnswerProcessed(true);

    const answeredTime = Date.now() - problemStartTime.current;
    recordAttempt(currentProblem, isAnswerCorrect, answeredTime);

    if (problemSelector.current) {
      problemSelector.current.recordAttempt(isAnswerCorrect);
    }

    if (isAnswerCorrect) {
      setIsAnswerVisible(true);
      
      // 既存のタイマーがあればクリア
      if (nextProblemTimeoutRef.current) {
        clearTimeout(nextProblemTimeoutRef.current);
      }
      
      // 新しいタイマーをセット
      nextProblemTimeoutRef.current = setTimeout(() => {
        nextProblemTimeoutRef.current = null;
        getNextProblem();
      }, 500);
    } else {
      setUserInput('');
      // 不正解の場合は再入力を可能にするためisAnswerProcessedをリセット
      setIsAnswerProcessed(false);
    }
  }, [currentProblem, userInput, isTransitioning, isAnswerProcessed, recordAttempt, getNextProblem]);

  const handleNumberClick = useCallback((num: number) => {
    if (userInput.length < 2) {
      setUserInput(prev => prev + num.toString());
    }
  }, [userInput]);

  const handleDelete = useCallback(() => {
    setUserInput('');
  }, []);

  // キーボードイベントのハンドラを追加
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumberClick(parseInt(e.key));
      } else if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumberClick, handleSubmit, handleDelete]);

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
    <div className="flex items-center justify-center min-h-[80vh] overflow-hidden">
      <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-lg text-gray-600 select-none">
            {displayDate} {problemNumber}もんめ
          </div>
        </div>

        <div className="text-5xl text-center font-bold mb-8 text-gray-800 select-none leading-relaxed">
          {currentProblem.num1} {currentProblem.operator} {currentProblem.num2} = {' '}
          {isAnswerVisible || (isCorrect === true) ? calculateAnswer(currentProblem) : '?'}
        </div>

        <div className="h-12 flex items-center justify-center mb-6">
          {isCorrect !== null && (
            <div className={`text-2xl font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'} 
              transition-opacity duration-200 ease-in-out select-none`}>
              {isCorrect ? 'せいかい！' : 'ざんねん...'}
            </div>
          )}
        </div>

        <div className="mt-2">
          <NumberPad
            onNumberClick={handleNumberClick}
            onDelete={handleDelete}
            onSubmit={handleSubmit}
            currentInput={userInput}
          />
        </div>
      </div>
    </div>
  );
};
