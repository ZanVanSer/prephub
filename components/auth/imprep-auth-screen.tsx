import type { ReactNode } from "react";
import { DashboardIcon } from "@/components/ui/icons";

interface AuthScreenProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function ImprepAuthScreen({ title, description, children }: AuthScreenProps) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark" aria-hidden="true">
            <DashboardIcon />
          </span>
          <strong>ToolHub</strong>
        </div>
        <div className="auth-copy">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
