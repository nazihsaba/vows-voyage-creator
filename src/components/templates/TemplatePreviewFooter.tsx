import aureaLogo from "@/assets/aureaLogoFullColored.png";

const TemplatePreviewFooter = () => {
  return (
    <footer className="py-8 px-4 bg-white">
      <div className="flex items-center justify-center gap-2">
        <span className="text-muted-foreground text-sm font-medium tracking-wide">Powered by</span>
        <img src={aureaLogo} alt="Auréa Invites" className="h-7 object-contain" />
      </div>
    </footer>
  );
};

export default TemplatePreviewFooter;
