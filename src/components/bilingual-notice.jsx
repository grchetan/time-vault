export function BilingualNotice({ en, hi }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3 space-y-1">
      <p className="text-sm text-foreground">{en}</p>
      <p className="text-sm text-muted-foreground font-devanagari">{hi}</p>
    </div>
  );
}
