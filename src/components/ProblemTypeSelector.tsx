// components/ProblemTypeSelector.tsx
import React from 'react';
import { ProblemType, ProblemTypeLabels } from '../types/mathProblems';

interface ProblemTypeSelectorProps {
    selectedType: ProblemType | null;
    onSelectType: (type: ProblemType) => void;
    onShowHistory: () => void;
}

export const ProblemTypeSelector: React.FC<ProblemTypeSelectorProps> = ({
    selectedType,
    onSelectType,
    onShowHistory,
}) => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-6">
                けいさんカードアプリ
            </h2>
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                {Object.values(ProblemType).map((type) => (
                    <button
                        key={type}
                        onClick={() => onSelectType(type)}
                        className={`p-4 rounded-lg text-lg font-bold transition-colors ${selectedType === type
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-blue-500 border-2 border-blue-500 hover:bg-blue-50'
                            }`}
                    >
                        {ProblemTypeLabels[type]}
                    </button>
                ))}

                <button
                    onClick={onShowHistory}
                    className="p-4 rounded-lg text-lg font-bold bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                    がくしゅう きろくを みる
                </button>
            </div>
        </div>
    );
};