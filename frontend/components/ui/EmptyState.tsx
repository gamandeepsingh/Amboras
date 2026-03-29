interface EmptyStateProps {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="text-4xl opacity-30">◈</div>
      <p className="text-sm font-medium text-white/60">{title}</p>
      {description && <p className="text-xs text-white/30">{description}</p>}
    </div>
  );
}
