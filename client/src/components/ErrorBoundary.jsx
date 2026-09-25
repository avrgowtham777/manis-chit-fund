import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center p-6">
          <div className="cyber-card p-8 rounded-3xl max-w-lg w-full text-center border-2 border-rose-500/50 shadow-2xl">
            <span className="text-5xl block mb-4">⚠️</span>
            <h2 className="text-2xl font-black text-rose-300">Something Went Wrong</h2>
            <p className="text-slate-300 text-sm mt-2 mb-6">
              An unexpected display error occurred. Please click below to reload or return to the main dashboard.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-slate-800 text-slate-200 font-bold rounded-2xl hover:bg-slate-700 text-sm"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/admin'}
                className="gold-glow-button px-6 py-3 rounded-2xl font-black text-sm uppercase"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
