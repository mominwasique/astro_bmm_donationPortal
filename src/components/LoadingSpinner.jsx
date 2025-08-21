import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'default', className = '' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        default: 'w-8 h-8',
        large: 'w-12 h-12',
    };

    return (
        <div className="flex items-center justify-center min-h-[200px]">
            <Loader2
                className={`${sizeClasses[size]} ${className} animate-spin text-primary`}
                aria-label="Loading"
            />
        </div>
    );
};

export default LoadingSpinner; 