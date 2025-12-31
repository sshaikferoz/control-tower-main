import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

interface FeedbackDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comments: string) => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(1);
    const [comments, setComments] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [error, setError] = useState(''); // for validation error message

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (comments.trim() === '') {
            setError('This is a required field');
            return;
        }
        setError('');
        onSubmit(rating, comments);
        // Reset form
        setRating(1);
        setComments('');
    };

    const handleClose = () => {
        setRating(1);
        setComments('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex h-full items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Help us improve</h3>
                    <button
                        onClick={handleClose}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            How would you rate this response?
                        </label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="rounded p-1 transition-colors hover:bg-gray-100"
                                >
                                    <Star
                                        size={24}
                                        className={`${star <= (hoveredRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                            } transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                            {rating === 1 && 'Very Poor'}
                            {rating === 2 && 'Poor'}
                            {rating === 3 && 'Average'}
                            {rating === 4 && 'Good'}
                            {rating === 5 && 'Excellent'}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="comments" className="mb-2 block text-sm font-medium text-gray-700">
                            What could be improved? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            rows={4}
                            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${error
                                ? 'border-red-500 text-red-600 placeholder-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                : 'border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                }`}
                            placeholder="Please share specific feedback about what went wrong or how we can improve..."
                        />
                        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                        >
                            Submit Feedback
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackDialog;