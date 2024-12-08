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

    return (
        <div className="mt-4">
            {/* 入力表示エリア */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 mb-4 text-4xl text-center font-bold text-gray-800 h-16">
                {currentInput || '_'}
            </div>

            {/* 数字キーパッド */}
            <div className="grid grid-cols-3 gap-2">
                {numbers.map((num) => (
                    <button
                        key={num}
                        onClick={() => onNumberClick(num)}
                        className={` p-4 text-2xl font-bold rounded-lg ${num === 0 ? 'col-span-3' : ''} bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors duration-200 `}
                    >
                        {num}
                    </button>
                ))}

                <button
                    onClick={onDelete}
                    className="col-span-2 p-4 text-xl font-bold rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-800 transition-colors duration-200"
                >
                    けす
                </button>

                <button
                    onClick={onSubmit}
                    className="p-4 text-xl font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
                >
                    かくにん
                </button>
            </div>
        </div>
    );
};