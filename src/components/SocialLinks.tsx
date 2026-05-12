import { Instagram, Linkedin } from "lucide-react";

export const SocialLinks = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <a
        href="https://twitter.com/EventSparks"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Twitter"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      <a
        href="https://www.instagram.com/eventsparks_?igsh=MTZxeW90cDdydGV4MA%3D%3D&utm_source=qr"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Instagram"
      >
        <Instagram className="w-5 h-5" />
      </a>
      <a
        href="https://linkedin.com/company/EventSparks"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="LinkedIn"
      >
        <Linkedin className="w-5 h-5" />
      </a>
    </div>
  );
};
