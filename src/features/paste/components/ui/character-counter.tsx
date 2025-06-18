interface CharacterCounterProps {
  current: number;
  limit: number | null;
  className?: string;
}

export function CharacterCounter({ current, limit, className }: CharacterCounterProps) {
  // Handle unlimited scenario
  if (limit === null) {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
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
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className={getColorClass()}>
          {current.toLocaleString()} / {limit.toLocaleString()}
        </span>
        {remaining < 0 ? (
          <span className="text-red-600 font-medium">
            • {Math.abs(remaining).toLocaleString()} over limit
          </span>
        ) : (
          <span className="text-muted-foreground">
            • {remaining.toLocaleString()} remaining
          </span>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-1">
        <div
          className={`h-1 rounded-full transition-all duration-200 ${getProgressClass()}`}
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>
      
      {/* Warning message */}
      {percentage >= 100 && (
        <p className="text-xs text-red-600 font-medium">
          Content exceeds character limit
        </p>
      )}
      {percentage >= 90 && percentage < 100 && (
        <p className="text-xs text-orange-500">
          Approaching character limit
        </p>
      )}
    </div>
  );
}