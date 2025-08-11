# 1st Math Drill App - Project Overview

## Purpose
This is a math drill application built in Japanese for elementary school students. The app provides practice with basic arithmetic operations:
- くりあがりのない 足し算 (Addition without carrying)
- くりさがりのない 引き算 (Subtraction without borrowing) 
- くりあがりのある 足し算 (Addition with carrying)
- くりさがりのある 引き算 (Subtraction with borrowing)

The app tracks learning history and provides statistics on student performance.

## Tech Stack
- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.0.1
- **Styling**: Tailwind CSS 3.4.16 with PostCSS
- **UI Components**: Custom React components with lucide-react icons
- **Charts**: Recharts 2.14.1 for data visualization
- **Type Checking**: TypeScript with strict mode enabled

## Main Features
- Problem type selection interface
- Interactive math problem solving with number pad
- Learning history tracking with local storage
- Performance statistics and analytics
- Daily learning records
- Past records review

## Architecture
The app follows a component-based architecture with:
- Context providers for state management (LearningHistoryContext)
- Custom hooks for data management (useLearningHistory)
- Type definitions for type safety
- Utility functions for date handling and problem selection
- Centralized problem data management