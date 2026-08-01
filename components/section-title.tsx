type Props = {
  title: string;
  subtitle?: string;
  light?: boolean;
};

export function SectionTitle({ title, subtitle, light }: Props) {
  return (
    <div className="mx-auto max-w-2xl text-center mb-12">
      <h2
        className={`text-3xl sm:text-4xl font-black tracking-tight ${
          light ? "text-white" : "text-primary-dark"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-base ${light ? "text-white/70" : "text-ink/60"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
