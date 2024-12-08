import { useState } from 'react';
import './App.css';
import { ProblemTypeSelector } from './components/ProblemTypeSelector';
import { MathProblem } from './components/MathProblem';
import { ProblemType } from './types/mathProblems';

function App() {
  const [selectedProblemType, setSelectedProblemType] = useState<ProblemType | null>(null);

  const handleProblemTypeSelect = (type: ProblemType) => {
    setSelectedProblemType(type);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        けいさん れんしゅう
      </h1>

      {!selectedProblemType ? (
        <ProblemTypeSelector
          selectedType={selectedProblemType}
          onSelectType={handleProblemTypeSelect}
        />
      ) : (
        <div>
          <button
            onClick={() => setSelectedProblemType(null)}
            className="mb-4 px-4 py-2 text-blue-500 hover:text-blue-600 transition-colors"
          >
            ← もどる
          </button>
          <MathProblem problemType={selectedProblemType} />
        </div>
      )}
    </div>
  );
}

export default App;