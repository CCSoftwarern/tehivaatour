type Props = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: Props) {
  return (
    <section
      className="text-white"
      style={{
        background:
          "linear-gradient(135deg, var(--cor-primaria-escura) 0%, var(--cor-primaria) 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-3 max-w-2xl text-white/80">{subtitle}</p>}
      </div>
    </section>
  );
}
