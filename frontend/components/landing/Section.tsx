type Props = {
  id?: string;
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
};

export default function Section({
  id,
  title,
  description,
  className,
  children,
}: Props) {
  return (
    <section id={id} className={`py-24 scroll-mt-24 ${className || ""}`}>
      <div className="max-w-6xl mx-auto px-6">

        {(title || description) && (
          <div className="text-center mb-16">

            {title && (
              <h2 className="text-3xl font-semibold tracking-tight">
                {title}
              </h2>
            )}

            {description && (
              <p className="text-slate-400 mt-3 max-w-xl mx-auto">
                {description}
              </p>
            )}

          </div>
        )}

        {children}

      </div>
    </section>
  );
}
