export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary shadow-[0_6px_16px_-6px_var(--brand)]">
        <span
          className="text-brand-foreground text-lg font-black leading-none"
          style={{ color: "var(--brand)" }}
        >
          Só
        </span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-lg font-extrabold text-primary">
          Só<span style={{ color: "var(--brand)" }}>Comprar</span>
        </span>
        <span className="text-[10px] font-medium tracking-wide text-muted-foreground">
          A gente pesquisa. Você economiza.
        </span>
      </div>
    </div>
  );
}
