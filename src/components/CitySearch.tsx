import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { AFRICAN_LOCATIONS, getCitiesForCountry } from "@/lib/locations";

interface CitySearchProps {
  value: string;
  onChange: (city: string, country?: string) => void;
  country?: string;
  className?: string;
  placeholder?: string;
}

export const CitySearch = ({
  value,
  onChange,
  country,
  className,
  placeholder = "Search city...",
}: CitySearchProps) => {
  const [open, setOpen] = useState(false);

  // If a country is set, only show its cities. Otherwise show every African city.
  const options = useMemo(() => {
    if (country) {
      return getCitiesForCountry(country).map((city) => ({ city, country }));
    }
    return Object.entries(AFRICAN_LOCATIONS).flatMap(([c, cities]) =>
      cities.map((city) => ({ city, country: c }))
    );
  }, [country]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between rounded-full pl-9 relative font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Type a city..." />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all-cities"
                onSelect={() => {
                  onChange("", country);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
                All cities
              </CommandItem>
              {options.map(({ city, country: c }) => (
                <CommandItem
                  key={`${c}-${city}`}
                  value={`${city} ${c}`}
                  onSelect={() => {
                    onChange(city, c);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === city ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{city}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{c}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
