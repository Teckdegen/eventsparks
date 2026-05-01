import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroImage from "@/assets/hero-event.jpg";
import { CreateEventDialog, type EventFormData } from "./CreateEventDialog";
import { AFRICAN_COUNTRIES } from "@/lib/locations";

const heroCategories = ["Blockchain", "Tech", "AI", "Hackathon", "Meetup", "Workshop", "Webinar", "Bootcamp"];

interface HeroSectionProps {
  onCreateEvent: (e: EventFormData) => void;
  isAdmin: boolean;
  onSearch?: (location: string, category: string) => void;
}

export const HeroSection = ({ onCreateEvent, isAdmin, onSearch }: HeroSectionProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const location = (formData.get("location") as string) || "";
    const category = (formData.get("category") as string) || "";
    onSearch?.(location, category);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl mx-4 mt-4 md:mx-8 md:mt-8">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Tech event atmosphere" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>
      <div className="relative z-10 px-8 py-20 md:px-16 md:py-32 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-normal tracking-tight text-primary-foreground leading-[1.1] mb-4">
          Discover Events Around You
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-md" style={{ fontFamily: "var(--font-body)" }}>
          Find blockchain conferences, hackathons, meetups & workshops across Africa.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              name="location"
              placeholder="City or country..."
              className="pl-9 rounded-full bg-background/90 backdrop-blur-sm border-none"
            />
          </div>
          <Select name="category">
            <SelectTrigger className="w-full sm:w-40 rounded-full bg-background/90 backdrop-blur-sm border-none">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {heroCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" size="icon" className="rounded-full shrink-0">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        {isAdmin && (
          <div className="mt-6">
            <CreateEventDialog onCreateEvent={onCreateEvent} />
          </div>
        )}
      </div>
    </section>
  );
};
