import type { ReactNode } from "react";
import { PageShell } from "./PageShell";

export function Article({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 text-muted-foreground">{description}</p>}
        <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-primary [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1 [&_strong]:text-foreground">
          {children}
        </div>
      </article>
    </PageShell>
  );
}
