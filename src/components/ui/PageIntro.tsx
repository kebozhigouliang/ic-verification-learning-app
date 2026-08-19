interface PageIntroProps {
  code: string;
  title: string;
  description: string;
}

export function PageIntro({ code, title, description }: PageIntroProps) {
  return (
    <header className="page-intro">
      <p className="day-code">{code}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
