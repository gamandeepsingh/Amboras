interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="text-3xl">⚠</div>
      <p className="text-sm text-white/50">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-white/20 hover:text-white/80"
        >
          Try again
        </button>
      )}
    </div>
  );
}
