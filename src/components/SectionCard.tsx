interface SectionCardProps {
  href: string;
  title: string;
  description: string;
  icon?: string;
}

export function SectionCard({
  href,
  title,
  description,
  icon
}: SectionCardProps) {
  return (
    <a
      href={href}
      className="group flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-sm transition-transform transition-colors duration-200 hover:-translate-y-0.5 hover:border-warmBeige/70 hover:bg-slate-900 hover:shadow-md"
    >
      <div>
        <div className="mb-2 flex items-center gap-2">
          {icon && (
            <span className="text-lg" aria-hidden="true">
              {icon}
            </span>
          )}
          <h3 className="text-base font-semibold text-slate-100 md:text-lg">
            {title}
          </h3>
        </div>
        <p className="text-sm text-slate-300 md:text-base">{description}</p>
      </div>
      <span className="mt-4 inline-flex items-center text-[11px] font-medium text-slate-500 group-hover:text-slate-200">
        섹션으로 천천히 내려가기
        <span className="ml-1 text-xs transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </a>
  );
}


