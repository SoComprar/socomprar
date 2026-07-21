export function Logo({
  className = "",
  iconClassName = "h-9 w-9",
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/logo-icon.png"
        alt="SóComprar"
        className={`rounded-xl shadow-[0_6px_16px_-6px_var(--brand)] ${iconClassName}`}
      />
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
