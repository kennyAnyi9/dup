interface CharacterCounterProps {
  current: number;
  limit: number | null;
  className?: string;
}

export function CharacterCounter({ current, limit, className }: CharacterCounterProps) {
  
  // Handle unlimited scenario
  if (limit === null) {
    return (
      <div className={`space-y-1 ${className}`} id="character-count" aria-live="polite">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground" aria-label={`${current.toLocaleString()} characters entered`}>
            {current.toLocaleString()} characters
          </span>
        </div>
      </div>
    );
  }

  const remaining = limit - current;
  const percentage = (current / limit) * 100;
  
  // Determine color based on percentage
  const getColorClass = () => {
    if (percentage >= 100) return "text-red-600";
    if (percentage >= 90) return "text-orange-500";
    if (percentage >= 75) return "text-yellow-500";
    return "text-muted-foreground";
  };

  const getProgressClass = () => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 90) return "bg-orange-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <div className={`space-y-1 ${className}`} id="character-count" aria-live="polite">
      <div className="flex items-center justify-between text-sm">
        <span 
          className={getColorClass()}
          aria-label={`${current.toLocaleString()} of ${limit.toLocaleString()} characters used`}
        >
          {current.toLocaleString()} / {limit.toLocaleString()}
        </span>
        {remaining < 0 ? (
          <span 
            className="text-red-600 font-medium"
            aria-label={`${Math.abs(remaining).toLocaleString()} characters over limit`}
          >
            • {Math.abs(remaining).toLocaleString()} over limit
          </span>
        ) : (
          <span 
            className="text-muted-foreground"
            aria-label={`${remaining.toLocaleString()} characters remaining`}
          >
            • {remaining.toLocaleString()} remaining
          </span>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-1" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={limit} aria-label="Character usage">
        <div
          className={`h-1 rounded-full transition-all duration-200 ${getProgressClass()}`}
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>
      
      {/* Warning message */}
      {percentage >= 100 && (
        <p className="text-xs text-red-600 font-medium" role="alert">
          Content exceeds character limit
        </p>
      )}
      {percentage >= 90 && percentage < 100 && (
        <p className="text-xs text-orange-500" role="status">
          Approaching character limit
        </p>
      )}
    </div>
  );
}