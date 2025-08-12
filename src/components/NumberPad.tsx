import React from 'react';

interface NumberPadProps {
    onNumberClick: (num: number) => void;
    onDelete: () => void;
    onSubmit: () => void;
    currentInput: string;
}

export const NumberPad: React.FC<NumberPadProps> = ({
    onNumberClick,
    onDelete,
    onSubmit,
    currentInput
}) => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

    // iPhone/Safariでのタッチイベント最適化
    const handleButtonClick = (callback: () => void) => (event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        event.stopPropagation();
        callback();
    };

    return (
        <div className="mt-4">
            {/* 入力表示エリア */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 mb-4 text-4xl text-center font-bold text-gray-800 h-16">
                {currentInput || '_'}
            </div>

            {/* 数字キーパッドと操作ボタン */}
            <div className="grid grid-cols-3 gap-2">
                {/* 数字 1-9 */}
                {numbers.slice(0, 9).map((num) => (
                    <button
                        key={num}
                        onClick={handleButtonClick(() => onNumberClick(num))}
                        onTouchEnd={handleButtonClick(() => onNumberClick(num))}
                        className="py-3 px-2 md:p-4 text-2xl font-bold rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors duration-200 flex items-center justify-center"
                    >
                        {num}
                    </button>
                ))}

                {/* けす */}
                <button
                    onClick={handleButtonClick(onDelete)}
                    onTouchEnd={handleButtonClick(onDelete)}
                    className="py-3 px-2 md:p-4 text-lg md:text-xl font-bold rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-800 transition-colors duration-200 flex items-center justify-center"
                >
                    けす
                </button>

                {/* 0 */}
                <button
                    onClick={handleButtonClick(() => onNumberClick(0))}
                    onTouchEnd={handleButtonClick(() => onNumberClick(0))}
                    className="py-3 px-2 md:p-4 text-2xl font-bold rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors duration-200 flex items-center justify-center"
                >
                    0
                </button>

                {/* かくにん */}
                <button
                    onClick={handleButtonClick(onSubmit)}
                    onTouchEnd={handleButtonClick(onSubmit)}
                    className="py-3 px-2 md:p-4 text-lg md:text-xl font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 flex items-center justify-center"
                >
                    かくにん
                </button>
            </div>
        </div>
    );
};