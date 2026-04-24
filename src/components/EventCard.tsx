import { Calendar, MapPin, Globe, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { CategoryIcon } from "@/components/CategoryIcon";

export interface EventData {
  id: string;
  title: string;
  date: string;
  time?: string | null;
  location: string;
  description: string | null;
  category: string;
  image?: string | null;
  country?: string | null;
  city?: string | null;
  registration_link?: string | null;
}

const categoryColors: Record<string, string> = {
  Bitcoin: "bg-[hsl(36,100%,50%)] text-primary-foreground",
  Ethereum: "bg-[hsl(240,60%,55%)] text-primary-foreground",
  Solana: "bg-[hsl(270,80%,55%)] text-primary-foreground",
  Base: "bg-[hsl(220,90%,55%)] text-primary-foreground",
  TON: "bg-[hsl(200,80%,50%)] text-primary-foreground",
  Cosmos: "bg-[hsl(260,50%,50%)] text-primary-foreground",
  Polkadot: "bg-[hsl(340,80%,55%)] text-primary-foreground",
  "Multi-Chain": "bg-primary text-primary-foreground",
  AI: "bg-[hsl(160,70%,40%)] text-primary-foreground",
  "Blockchain Conference": "bg-primary text-primary-foreground",
  "Tech Conference": "bg-accent text-accent-foreground",
  Hackathon: "bg-secondary text-secondary-foreground",
  Meetup: "bg-primary/80 text-primary-foreground",
  Workshop: "bg-accent/80 text-accent-foreground",
  Webinar: "bg-secondary/80 text-secondary-foreground",
  Summit: "bg-primary/60 text-primary-foreground",
  Bootcamp: "bg-accent/60 text-accent-foreground",
  Other: "bg-muted text-muted-foreground",
};

export const EventCard = ({ event }: { event: EventData }) => {
  return (
    <Link to={`/event/${event.id}`}>
      <Card className="group overflow-hidden border-border/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 cursor-pointer">
        <div className="aspect-video overflow-hidden bg-muted">
          {event.image ? (
            <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-primary/40" />
            </div>
          )}
        </div>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={`${categoryColors[event.category] || categoryColors.Other} gap-1.5`}>
              <CategoryIcon category={event.category} />
              {event.category}
            </Badge>
            {event.registration_link && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                <ExternalLink className="w-3 h-3" /> Register
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold leading-tight line-clamp-2" style={{ fontFamily: "var(--font-display)" }}>
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{event.date}</span>
            </div>
            {(event.city || event.country) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-3.5 h-3.5" />
                <span>{[event.city, event.country].filter(Boolean).join(", ")}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{event.location}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
