import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, RotateCcw, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  tabName?: string;
  onReset?: () => void;
  language?: 'bn' | 'en';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Dashboard Error Boundary] Caught runtime error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleCopyError = () => {
    const details = `[Blogge Dashboard Error]
Tab: ${this.props.tabName || 'unknown'}
Message: ${this.state.error?.message || 'No message'}
Stack: ${this.state.error?.stack || ''}
ComponentStack: ${this.state.errorInfo?.componentStack || ''}
Time: ${new Date().toISOString()}`;

    navigator.clipboard.writeText(details);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2500);
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isBn = this.props.language !== 'en';
      const tabTitle = this.props.tabName ? `"${this.props.tabName}"` : '';

      return (
        <div id="dashboard-error-boundary-screen" className="w-full max-w-4xl mx-auto p-4 sm:p-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-xl overflow-hidden">
            {/* Header banner */}
            <div className="bg-rose-500/10 dark:bg-rose-950/40 p-6 border-b border-rose-100 dark:border-rose-900/40 flex items-start gap-4">
              <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/30 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isBn ? `এই ফাংশনটি লোড করতে সমস্যা হয়েছে ${tabTitle}` : `Failed to load dashboard function ${tabTitle}`}
                  </h2>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {isBn
                    ? 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। তবে প্ল্যাটফর্মের বাকি সব অংশ চালু রয়েছে। আপনি পুনরায় চেষ্টা করতে পারেন বা অন্য ট্যাবে যেতে পারেন।'
                    : 'An unexpected runtime error occurred in this view. Other sections remain functional. You can retry or return to the dashboard overview.'}
                </p>
              </div>
            </div>

            {/* Content area */}
            <div className="p-6 space-y-6">
              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  id="btn-error-retry"
                  onClick={this.handleRetry}
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{isBn ? 'পুনরায় চেষ্টা করুন (Retry)' : 'Retry Loading'}</span>
                </button>

                <button
                  type="button"
                  id="btn-error-home"
                  onClick={() => {
                    localStorage.setItem('blogge_dashboard_tab', 'home');
                    window.location.href = '#home';
                    this.setState({ hasError: false, error: null, errorInfo: null });
                    window.location.reload();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl transition"
                >
                  <Home className="w-4 h-4" />
                  <span>{isBn ? 'ড্যাশবোর্ডে ফিরে যান' : 'Back to Dashboard'}</span>
                </button>

                <button
                  type="button"
                  id="btn-error-reload"
                  onClick={this.handleReload}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isBn ? 'পেজ রিলোড করুন' : 'Reload App'}</span>
                </button>

                <button
                  type="button"
                  id="btn-error-copy"
                  onClick={this.handleCopyError}
                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-xl transition ml-auto"
                >
                  {this.state.copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {isBn ? 'কপি হয়েছে' : 'Copied!'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{isBn ? 'ত্রুটির বিবরণ কপি করুন' : 'Copy Error Details'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Collapsible Error Debug Details */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline"
                >
                  {this.state.showDetails
                    ? (isBn ? '▼ টেকনিক্যাল বিবরণ লুকান' : '▼ Hide technical details')
                    : (isBn ? '▶ টেকনিক্যাল বিবরণ দেখুন' : '▶ Show technical details')}
                </button>

                {this.state.showDetails && (
                  <div className="mt-3 p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-[11px] overflow-x-auto space-y-2 border border-slate-800">
                    <div className="text-rose-400 font-bold">
                      Error: {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unknown'}
                    </div>
                    {this.state.error?.stack && (
                      <pre className="text-slate-400 whitespace-pre-wrap text-[10px]">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
