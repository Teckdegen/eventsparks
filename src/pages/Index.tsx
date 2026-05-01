import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { EventCard } from "@/components/EventCard";
import { CreateEventDialog, type EventFormData } from "@/components/CreateEventDialog";
import { Search, MapPin, Calendar } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SocialLinks } from "@/components/SocialLinks";
import { CategoryIcon } from "@/components/CategoryIcon";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { SubscribePopup } from "@/components/SubscribePopup";
import { AiChat } from "@/components/AiChat";
import logo from "@/assets/eventsparks-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { AFRICAN_COUNTRIES, getCitiesForCountry } from "@/lib/locations";
import { CitySearch } from "@/components/CitySearch";
import { Badge } from "@/components/ui/badge";

// Grouped category structure
const categoryGroups = [
  {
    label: "Blockchain",
    items: ["Bitcoin", "Ethereum", "Solana", "Base", "TON", "Cosmos", "Polkadot", "Multi-Chain"],
  },
  {
    label: "Tech",
    items: ["Tech Conference"],
  },
  {
    label: "AI",
    items: ["AI"],
  },
];

const eventTypes = ["Hackathon", "Meetup", "Workshop", "Webinar", "Summit", "Bootcamp"];

// Flat list for filtering
const allCategories = [
  "All",
  ...categoryGroups.flatMap((g) => [g.label, ...g.items]),
  ...eventTypes,
  "Other",
];

// Which filter pills to show (top-level groups + event types)
const filterTabs = ["All", "Blockchain", "Tech", "AI", "Hackathon", "Meetup", "Workshop", "Webinar", "Summit", "Bootcamp"];

const fetchEvents = async () => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

// Map group label → all child categories for filtering
const groupChildren: Record<string, string[]> = {};
categoryGroups.forEach((g) => {
  groupChildren[g.label] = [g.label, ...g.items];
});

const Index = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Category matching: if a group label is selected, match all children
      let matchesCategory = activeCategory === "All";
      if (!matchesCategory) {
        const children = groupChildren[activeCategory];
        if (children) {
          matchesCategory = children.includes(event.category);
        } else {
          matchesCategory = event.category === activeCategory;
        }
      }

      const matchesSearch =
        !search ||
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.location.toLowerCase().includes(search.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(search.toLowerCase()));
      const matchesCountry = !countryFilter || event.country === countryFilter;
      const matchesCity = !cityFilter || event.city === cityFilter;
      const matchesDate = !dateFilter || event.date === dateFilter;
      return matchesCategory && matchesSearch && matchesCountry && matchesCity && matchesDate;
    });
  }, [events, search, countryFilter, cityFilter, dateFilter, activeCategory]);

  const createMutation = useMutation({
    mutationFn: async (event: EventFormData) => {
      const { error } = await supabase.from("events").insert({
        title: event.title,
        date: event.date,
        time: event.time || "09:00",
        location: event.location,
        description: event.description || null,
        category: event.category,
        image: event.image || null,
        country: event.country || null,
        city: event.city || null,
        user_id: null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event published!");
    },
    onError: () => {
      toast.error("Failed to create event. Please try again.");
    },
  });

  const handleCreateEvent = (event: EventFormData) => {
    createMutation.mutate(event);
  };

  const handleHeroSearch = (location: string, category: string) => {
    if (location) {
      setCountryFilter(location);
      setCityFilter("");
    }
    if (category) setActiveCategory(category);
    document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 md:px-10">
        <img src={logo} alt="EventSparks" className="h-10 md:h-12" />
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </nav>

      <HeroSection onCreateEvent={handleCreateEvent} isAdmin={isAdmin} onSearch={handleHeroSearch} />

      <section id="events-section" className="px-4 py-16 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl tracking-tight mb-2">Upcoming Events</h2>
            <p className="text-muted-foreground">Blockchain conferences, hackathons & tech meetups across Africa</p>
          </div>
        </div>

        {/* Search & filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full"
            />
          </div>
          <div className="relative w-full sm:w-44">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
            <Select
              value={countryFilter || "__all"}
              onValueChange={(val) => {
                const next = val === "__all" ? "" : val;
                setCountryFilter(next);
                setCityFilter("");
              }}
            >
              <SelectTrigger className="pl-9 rounded-full">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="__all">All countries</SelectItem>
                {AFRICAN_COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-56">
            <CitySearch
              value={cityFilter}
              country={countryFilter}
              onChange={(city, c) => {
                setCityFilter(city);
                if (city && c && c !== countryFilter) setCountryFilter(c);
              }}
              placeholder="Search city..."
            />
          </div>
          <div className="relative w-full sm:w-44">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 rounded-full"
            />
          </div>
        </div>

        {/* Active location filter chips */}
        {(countryFilter || cityFilter) && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
            <span className="text-muted-foreground">Filtering by:</span>
            {countryFilter && (
              <Badge variant="secondary" className="gap-1.5 pr-1.5">
                <MapPin className="w-3 h-3" />
                {countryFilter}
                <button
                  onClick={() => { setCountryFilter(""); setCityFilter(""); }}
                  className="ml-1 rounded-full hover:bg-background/60 px-1"
                  aria-label="Clear country"
                >
                  ×
                </button>
              </Badge>
            )}
            {cityFilter && (
              <Badge variant="secondary" className="gap-1.5 pr-1.5">
                {cityFilter}
                <button
                  onClick={() => setCityFilter("")}
                  className="ml-1 rounded-full hover:bg-background/60 px-1"
                  aria-label="Clear city"
                >
                  ×
                </button>
              </Badge>
            )}
            <button
              onClick={() => { setCountryFilter(""); setCityFilter(""); }}
              className="text-xs text-primary hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Category filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filterTabs.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <CategoryIcon category={cat} />
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">Loading events...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
        {!isLoading && filteredEvents.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">
              {events.length === 0
                ? "No events yet. Check back soon!"
                : "No events match your filters."}
            </p>
          </div>
        )}
      </section>

      <footer className="border-t border-border/50 px-6 py-8 text-sm text-muted-foreground">
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <NewsletterSignup />
            <SocialLinks />
          </div>
          <p className="text-center text-xs">© 2026 EventSparks. Africa's blockchain & tech events hub.</p>
        </div>
      </footer>
      <SubscribePopup />
      <AiChat />
    </div>
  );
};

export default Index;
