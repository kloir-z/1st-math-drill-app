// hooks/useLearningHistory.ts
import { useContext } from 'react';
import { LearningHistoryContext } from '../contexts/LearningHistoryContext';

export const useLearningHistory = () => {
    const context = useContext(LearningHistoryContext);
    if (!context) {
        throw new Error('useLearningHistory must be used within a LearningHistoryProvider');
    }
    return context;
};