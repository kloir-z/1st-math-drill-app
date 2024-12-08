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
    <div className="min-h-screen min-w-screen bg-gray-50 select-none">
      <div className="container mx-auto px-4 py-4 md:px-0 md:py-8 max-w-2xl">
        {!selectedProblemType ? (
          <ProblemTypeSelector
            selectedType={selectedProblemType}
            onSelectType={handleProblemTypeSelect}
          />
        ) : (
          <MathProblem problemType={selectedProblemType} />
        )}
      </div>
    </div>
  );
}

export default App;