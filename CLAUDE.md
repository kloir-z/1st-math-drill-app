# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Japanese elementary math drill application built with React, TypeScript, and Vite. The app helps first-grade students practice basic addition and subtraction problems with Japanese language interface. Students can choose from different problem types, solve math problems with a custom number pad, and track their learning progress over time.

## Common Development Commands

```bash
# Development server
npm run dev

# Build the application  
npm run build

# Type checking and build
tsc -b && vite build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### Core Problem System
- **Problem Types**: Five distinct types defined in `ProblemType` enum:
  - `AdditionNoCarry` (くりあがりのない足し算)
  - `SubtractionNoBorrow` (くりさがりのない引き算)  
  - `AdditionWithCarry` (くりあがりのある足し算)
  - `SubtractionWithBorrow` (くりさがりのある引き算)
  - `MixedReview` (おさらいモード)

- **Problem Data**: All math problems are pre-defined in `src/data/mathProblems.ts` with arrays for each problem type. Problems are objects containing `num1`, `num2`, `operator`, and `type` properties.

### State Management Architecture
- **React Context**: Uses `LearningHistoryContext` to manage learning history state across components
- **Provider Pattern**: `LearningHistoryProvider` wraps the app and provides learning history functionality
- **Local Storage**: All learning data persists to browser localStorage with key `'math-learning-history'`

### Learning History System
The app tracks detailed learning analytics:
- **Problem-level tracking**: Individual attempt records per unique problem (e.g., "1+2")
- **Type-level statistics**: Aggregated stats per problem type (accuracy, timing, etc.)
- **Daily tracking**: Daily problem counts and incorrect problem records
- **Time limits**: 5-minute maximum per problem (`MAX_ANSWER_TIME = 300000ms`)

### Component Structure
- **App.tsx**: Main application logic with problem type selection and history toggle
- **ProblemTypeSelector**: Japanese interface for choosing math problem categories
- **MathProblem**: Core problem-solving component with number pad interface
- **LearningHistory**: Analytics dashboard showing progress charts and statistics
- **NumberPad**: Custom touch-friendly number input component

### Key Type Definitions
- `MathProblem`: Core problem interface with numbers, operator, and type
- `LearningHistory`: Complete learning data structure with nested tracking
- `ProblemHistory`: Individual problem attempt records with timestamps
- `AttemptRecord`: Single solve attempt with correctness and timing data

### UI/UX Considerations
- **Japanese Language**: All UI text and labels are in Japanese
- **Mobile-First**: Designed for touch interaction with select-none styling
- **Responsive**: Uses Tailwind CSS with mobile-optimized layouts
- **Keyboard Support**: Supports keyboard input for problem solving

### Problem Generation Logic
- Problems are pre-defined arrays, not algorithmically generated
- Each problem type has specific number ranges (e.g., carry problems use results 10-18)
- Mixed review mode combines all problem types
- Problem selection uses weighted randomization based on past performance