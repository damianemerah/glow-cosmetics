interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-primary font-montserrat">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
