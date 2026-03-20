type PageIntroProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

export function PageIntro({
  eyebrow,
  title,
  description,
}: PageIntroProps) {
  return (
    <div className="max-w-3xl space-y-3 pt-2">
      {eyebrow ? <p className="text-sm text-slate-500">{eyebrow}</p> : null}
      <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">{title}</h1>
      <p className="text-base leading-7 text-slate-600">{description}</p>
    </div>
  );
}
