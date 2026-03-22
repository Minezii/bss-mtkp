'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    onRatingChange?: (rating: number) => void;
    interactive?: boolean;
    size?: number;
}

export default function StarRating({
    rating,
    maxRating = 5,
    onRatingChange,
    interactive = false,
    size = 20
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[...Array(maxRating)].map((_, i) => {
                const starValue = i + 1;
                const isFull = (hoverRating || rating) >= starValue;

                return (
                    <button
                        key={i}
                        type="button"
                        disabled={!interactive}
                        onMouseEnter={() => interactive && setHoverRating(starValue)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                        onClick={() => interactive && onRatingChange?.(starValue)}
                        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-all`}
                    >
                        <Star
                            size={size}
                            className={isFull ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}
                        />
                    </button>
                );
            })}
        </div>
    );
}
