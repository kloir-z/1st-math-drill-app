import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LearningHistoryProvider } from './components/LearningHistoryProvider'
import React from 'react'

// エラーハンドリング関数
const handleError = (error: Error, errorInfo?: unknown) => {
  console.error('Application Error:', error);
  console.error('Error Info:', errorInfo);
  
  // iPhone/Safari でのデバッグのため、アラートも表示
  if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('Safari')) {
    alert(`Error: ${error.message}\nStack: ${error.stack?.slice(0, 200)}...`);
  }
}

// グローバルエラーハンドラー
window.addEventListener('error', (event) => {
  handleError(new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  handleError(new Error(`Unhandled Promise Rejection: ${event.reason}`));
});

// React Error Boundary コンポーネント
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    handleError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          backgroundColor: '#fee',
          border: '2px solid #f00',
          margin: '20px',
          fontFamily: 'monospace'
        }}>
          <h2>アプリケーションエラーが発生しました</h2>
          <p>エラー: {this.state.error?.message}</p>
          <details>
            <summary>詳細情報</summary>
            <pre>{this.state.error?.stack}</pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              marginTop: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            リロード
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

console.log('Starting application...');
console.log('User Agent:', navigator.userAgent);
console.log('Document ready state:', document.readyState);

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('Root element found, creating React root...');
  const root = createRoot(rootElement);
  
  console.log('Rendering application...');
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <LearningHistoryProvider>
          <App />
        </LearningHistoryProvider>
      </ErrorBoundary>
    </StrictMode>
  );
  
  console.log('Application rendered successfully');
} catch (error) {
  console.error('Failed to initialize application:', error);
  handleError(error as Error);
}