import { AnimatedSection } from "@/hooks/useScrollAnimation";

interface StorySectionProps {
  groomFamily?: string;
  brideFamily?: string;
  description?: string;
  familySeparator?: React.ReactNode;
  className?: string;
  cardClassName?: string;
  id?: string;
}

const StorySection = ({
  groomFamily,
  brideFamily,
  description,
  familySeparator,
  className = "py-16 px-4 text-center",
  cardClassName = "",
  id,
}: StorySectionProps) => {
  return (
    <section id={id} className={className}>
      <AnimatedSection animation="fade-up">
        <div className={`max-w-3xl mx-auto space-y-8 ${cardClassName}`}>
          {(groomFamily || brideFamily) && (
            <div className="space-y-4">
              {groomFamily && <h2 className="text-template-subtitle">{groomFamily}</h2>}
              {familySeparator ?? <p className="text-2xl">&</p>}
              {brideFamily && <h2 className="text-template-subtitle">{brideFamily}</h2>}
            </div>
          )}
          {description && <p className="text-template-body">{description}</p>}
        </div>
      </AnimatedSection>
    </section>
  );
};

export default StorySection;
