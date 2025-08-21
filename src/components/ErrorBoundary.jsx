import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="text-center">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
                        <p className="text-gray-600 mb-4">
                            We apologize for the inconvenience. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-300"
                        >
                            Refresh Page
                        </button>
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-8 text-left">
                                <details className="text-sm">
                                    <summary className="cursor-pointer text-gray-600">Error Details</summary>
                                    <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-auto">
                                        {this.state.error?.toString()}
                                        <br />
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 