import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid #ff4444',
          borderRadius: '8px',
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          fontFamily: 'monospace'
        }}>
          <h3>🤖 RALPHBOT encountered an issue</h3>
          <p>Something went wrong with my circuits. Please refresh the page to restart me.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#00ffff',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            🔄 Restart RALPHBOT
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 