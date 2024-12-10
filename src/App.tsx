// App.tsx
import { useState } from 'react';
import { ProblemTypeSelector } from './components/ProblemTypeSelector';
import { MathProblem } from './components/MathProblem';
import { LearningHistory } from './components/LearningHistory';
import { ProblemType } from './types/mathProblems';

function App() {
  const [selectedProblemType, setSelectedProblemType] = useState<ProblemType | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleProblemTypeSelect = (type: ProblemType) => {
    setSelectedProblemType(type);
  };

  const handleBack = () => {
    setSelectedProblemType(null);
  };

  if (showHistory) {
    return <LearningHistory onClose={() => setShowHistory(false)} />;
  }

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 select-none">
      <div className="container mx-auto px-4 py-4 md:px-0 md:py-8 max-w-2xl">
        {!selectedProblemType ? (
          <ProblemTypeSelector
            selectedType={selectedProblemType}
            onSelectType={handleProblemTypeSelect}
            onShowHistory={() => setShowHistory(true)}
          />
        ) : (
          <MathProblem
            problemType={selectedProblemType}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}

export default App;