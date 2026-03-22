export const DASHBOARD_DEMO_TOOLS_KEY = "toolhub.dashboard.showDemoTools";
export const DEFAULT_SHOW_DEMO_TOOLS = true;
const DASHBOARD_DEMO_TOOLS_EVENT = "toolhub:dashboard-demo-tools-change";

export function readShowDemoToolsPreference() {
  if (typeof window === "undefined") {
    return DEFAULT_SHOW_DEMO_TOOLS;
  }

  const value = window.localStorage.getItem(DASHBOARD_DEMO_TOOLS_KEY);
  if (value === null) {
    return DEFAULT_SHOW_DEMO_TOOLS;
  }

  return value === "true";
}

export function writeShowDemoToolsPreference(value: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DASHBOARD_DEMO_TOOLS_KEY, String(value));
  window.dispatchEvent(new Event(DASHBOARD_DEMO_TOOLS_EVENT));
}

export function subscribeShowDemoToolsPreference(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === null || event.key === DASHBOARD_DEMO_TOOLS_KEY) {
      onChange();
    }
  }

  function handleLocalChange() {
    onChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(DASHBOARD_DEMO_TOOLS_EVENT, handleLocalChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(DASHBOARD_DEMO_TOOLS_EVENT, handleLocalChange);
  };
}
