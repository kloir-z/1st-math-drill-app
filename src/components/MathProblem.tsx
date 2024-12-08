import React, { useState, useEffect, useCallback } from 'react';
import { MathProblem as MathProblemType, ProblemType } from '../types/mathProblems';
import { allProblems, calculateAnswer } from '../data/mathProblems';
import { NumberPad } from './NumberPad';

interface MathProblemProps {
  problemType: ProblemType;
}

export const MathProblem: React.FC<MathProblemProps> = ({ problemType }) => {
  const [currentProblem, setCurrentProblem] = useState<MathProblemType | null>(null);
  const [remainingProblems, setRemainingProblems] = useState<MathProblemType[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);

  // 問題をシャッフルする関数
  const shuffleProblems = useCallback(() => {
    const problems = [...allProblems[problemType]];
    for (let i = problems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [problems[i], problems[j]] = [problems[j], problems[i]];
    }
    return problems;
  }, [problemType]);

  // 次の問題を取得する関数
  const getNextProblem = () => {
    if (remainingProblems.length === 0) {
      const shuffled = shuffleProblems();
      setRemainingProblems(shuffled.slice(1));
      setCurrentProblem(shuffled[0]);
      setCurrentProblemIndex(1); // 最初から始める
    } else {
      setCurrentProblem(remainingProblems[0]);
      setRemainingProblems(remainingProblems.slice(1));
      setCurrentProblemIndex(prev => prev + 1); // インクリメント
    }
    setUserInput('');
    setIsCorrect(null);
    setIsAnswerVisible(false);
  };

  // 数字がクリックされたときの処理
  const handleNumberClick = (num: number) => {
    if (userInput.length < 2) { // 2桁までの入力に制限
      setUserInput(prev => prev + num.toString());
    }
  };

  // 入力を削除する処理
  const handleDelete = () => {
    setUserInput('');
  };

  // 答え合わせの処理
  const handleSubmit = () => {
    if (!currentProblem || !userInput) return;

    const correctAnswer = calculateAnswer(currentProblem);
    const isAnswerCorrect = parseInt(userInput) === correctAnswer;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      // 正解の場合は答えを表示
      setIsAnswerVisible(true);
      // 少し待ってから次の問題へ
      setTimeout(() => {
        getNextProblem();
      }, 1500); // 1.5秒後に次の問題へ
    }
  };

  useEffect(() => {
    const shuffled = shuffleProblems();
    setRemainingProblems(shuffled.slice(1));
    setCurrentProblem(shuffled[0]);
    setCurrentProblemIndex(1); // 初期化時は1問目
  }, [problemType, shuffleProblems]);

  if (!currentProblem) {
    return <div className="text-gray-800">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        {/* 問題番号 */}
        <div className="text-lg text-gray-600 text-center mb-2">
          {currentProblemIndex}/{allProblems[problemType].length}もんめ
        </div>

        {/* 問題表示 */}
        <div className="text-5xl text-center font-bold mb-4 text-gray-800">
          {currentProblem.num1} {currentProblem.operator} {currentProblem.num2} =
          {isAnswerVisible || (isCorrect === true) ? calculateAnswer(currentProblem) : '?'}
        </div>

        {/* 固定高さのメッセージエリア */}
        <div className="h-12 flex items-center justify-center mb-4">
          {isCorrect !== null && (
            <div
              className={`text-2xl font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'} 
                transition-opacity duration-200 ease-in-out
              `}
            >
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
            onClick={() => setIsAnswerVisible(true)}
            className="w-full p-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 
              transition-colors disabled:bg-gray-300"
            disabled={isAnswerVisible || isCorrect === true}
          >
            こたえを みる
          </button>
        </div>
      </div>
    </div>
  );
};