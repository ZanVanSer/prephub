import Link from "next/link";

export function EmptyOutputState() {
  return (
    <section>
      <div className="border border-[var(--color-border)] bg-white p-8">
        <div className="max-w-xl space-y-4">
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-slate-950">
            No HTML yet.
          </h1>
          <p className="text-[15px] leading-7 text-slate-500">
            Go back to the editor, refresh the preview to generate HTML, and
            then reopen this page.
          </p>
          <Link
            href="/"
            className="inline-flex items-center rounded-[6px] border border-slate-900 bg-slate-900 px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-slate-800"
          >
            Back to Editor
          </Link>
        </div>
      </div>
    </section>
  );
}
