// components/ErrorBoundary.tsx
import  { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    state: State = {
        hasError: false,
    };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("🔥 Error caught in ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className='flex flex-col min-h-screen items-center justify-center p-3 bg-gray-100'>
                    <h1 className='text-4xl font-bold text-red-500'>
                        Oops! Something went wrong. ❌
                    </h1>
                    <p className='text-gray-700 mt-4 font-medium'>
                        Something went wrong with the part.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
