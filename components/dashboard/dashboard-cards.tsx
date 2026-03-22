"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import type { AppModuleView } from "@/lib/modules/access";
import {
  ChartIcon,
  FolderIcon,
  ImageIcon,
  MailIcon,
  SettingsIcon,
  SparklesIcon
} from "@/components/ui/icons";
import {
  DEFAULT_SHOW_DEMO_TOOLS,
  readShowDemoToolsPreference,
  subscribeShowDemoToolsPreference
} from "@/lib/dashboard-preferences";

const demoCards = [
  {
    title: "Generate Vector Logos from Text Prompts",
    kind: "feature"
  },
  {
    title: "Analytics",
    kind: "analytics"
  }
] as const;

type DashboardCardItem = {
  title: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  isDemo: boolean;
  href?: string;
};

function matchesSearch(value: string, query: string) {
  return value.toLowerCase().includes(query);
}

function getModuleIcon(icon: AppModuleView["icon"]) {
  if (icon === "image") {
    return <ImageIcon />;
  }

  if (icon === "mail") {
    return <MailIcon />;
  }

  if (icon === "settings") {
    return <SettingsIcon />;
  }

  return <FolderIcon />;
}

export function DashboardCards({
  userEmail,
  modules
}: {
  userEmail: string;
  modules: AppModuleView[];
}) {
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get("q") ?? "").trim().toLowerCase();
  const showDemoTools = useSyncExternalStore(
    subscribeShowDemoToolsPreference,
    readShowDemoToolsPreference,
    () => DEFAULT_SHOW_DEMO_TOOLS
  );

  const topCards: DashboardCardItem[] = [
    ...modules.map((module) => ({
      title: module.label,
      label: "Utility",
      description: module.description,
      href: module.href,
      icon: getModuleIcon(module.icon),
      isDemo: false
    })),
    {
      title: "Asset Manager",
      label: "Core",
      description: "Centralized hub for tagging, versioning, and distributing project deliverables.",
      icon: <FolderIcon />,
      isDemo: true
    }
  ];

  const visibleTopCards = topCards
    .filter((card) => showDemoTools || !card.isDemo)
    .filter((card) => !searchQuery || matchesSearch(card.title, searchQuery));

  const showFeatureCard =
    showDemoTools &&
    (!searchQuery || matchesSearch(demoCards[0].title, searchQuery));

  const showAnalyticsCard =
    showDemoTools &&
    (!searchQuery || matchesSearch(demoCards[1].title, searchQuery));

  const hasResults = visibleTopCards.length > 0 || showFeatureCard || showAnalyticsCard;

  return (
    <section className="dashboard-shell">
      <div className="dashboard-heading">
        <div>
          <h1 className="dashboard-heading__title">Welcome back, {userEmail}!</h1>
          <p className="dashboard-heading__subtitle">
            Your creative pipeline is ready. What would you like to build today?
          </p>
        </div>
        {showDemoTools ? (
          <div className="dashboard-credit-pill">
            <span className="dashboard-credit-pill__icon">
              <SparklesIcon />
            </span>
            <span>4.2k Credits</span>
          </div>
        ) : null}
      </div>

      {hasResults ? (
        <div className={showDemoTools ? "dashboard-grid" : "dashboard-grid dashboard-grid--compact"}>
          {visibleTopCards.map((card) => (
            <article key={card.title} className="dashboard-card">
              <div className="dashboard-card__icon">{card.icon}</div>
              <div className="dashboard-card__body">
                <h2 className="dashboard-card__title">{card.title}</h2>
                <p className="dashboard-card__description">{card.description}</p>
              </div>
              <div className="dashboard-card__footer">
                <span className="dashboard-card__label">{card.label}</span>
                {card.href ? (
                  <Link href={card.href} className="dashboard-card__action">
                    Open
                  </Link>
                ) : (
                  <span className="dashboard-card__action dashboard-card__action--static">Open</span>
                )}
              </div>
            </article>
          ))}

          {showFeatureCard ? (
            <article className="dashboard-feature-card">
              <div className="dashboard-feature-card__content">
                <span className="dashboard-feature-card__badge">New Feature</span>
                <h2 className="dashboard-feature-card__title">Generate Vector Logos from Text Prompts</h2>
                <p className="dashboard-feature-card__description">
                  Our new SVG engine allows you to create infinitely scalable assets using simple natural language.
                </p>
                <button type="button" className="dashboard-feature-card__button">
                  Try Beta
                </button>
              </div>
              <div className="dashboard-feature-card__preview" aria-hidden="true">
                <div className="dashboard-feature-card__preview-shell">
                  <div className="dashboard-feature-card__preview-logo" />
                </div>
              </div>
            </article>
          ) : null}

          {showAnalyticsCard ? (
            <article className="dashboard-card dashboard-card--analytics">
              <div className="dashboard-card__icon dashboard-card__icon--muted">
                <ChartIcon />
              </div>
              <div className="dashboard-card__body">
                <h2 className="dashboard-card__title">Analytics</h2>
                <p className="dashboard-card__description">
                  Monitor rendering times, project costs, and team productivity in real-time.
                </p>
              </div>
              <div className="dashboard-card__footer">
                <span className="dashboard-card__label">Stats</span>
                <span className="dashboard-card__action dashboard-card__action--static">Open</span>
              </div>
            </article>
          ) : null}
        </div>
      ) : (
        <div className="dashboard-empty-state">No tools found</div>
      )}
    </section>
  );
}
