import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AFRICAN_COUNTRIES, getCitiesForCountry } from "@/lib/locations";

const categoryGroups = [
  {
    label: "Blockchain",
    items: ["Bitcoin", "Ethereum", "Solana", "Base", "TON", "Cosmos", "Polkadot", "Multi-Chain"],
  },
  {
    label: "Tech & AI",
    items: ["Tech Conference", "AI"],
  },
  {
    label: "Event Type",
    items: ["Hackathon", "Meetup", "Workshop", "Webinar", "Summit", "Bootcamp"],
  },
  {
    label: "Other",
    items: ["Other"],
  },
];

export interface EventFormData {
  title: string;
  date: string;
  location: string;
  description: string;
  category: string;
  image: string;
  country: string;
  city: string;
  registration_link: string;
}

interface CreateEventDialogProps {
  onCreateEvent: (event: EventFormData) => void;
  editEvent?: EventFormData & { id: string };
  onEditEvent?: (event: EventFormData) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CreateEventDialog = ({
  onCreateEvent,
  editEvent,
  onEditEvent,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateEventDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyForm: EventFormData = { title: "", date: "", location: "", description: "", category: "", image: "", country: "", city: "", registration_link: "" };
  const [form, setForm] = useState<EventFormData>(editEvent || emptyForm);

  const [lastEditId, setLastEditId] = useState<string | undefined>();
  if (editEvent && editEvent.id !== lastEditId) {
    setForm(editEvent);
    setImagePreview(editEvent.image || null);
    setLastEditId(editEvent.id);
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("event-images").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(fileName);
      setForm((prev) => ({ ...prev, image: urlData.publicUrl }));
      setImagePreview(urlData.publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: "" }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.location || !form.category || !form.image || !form.country || !form.city) return;
    if (editEvent && onEditEvent) {
      onEditEvent(form);
    } else {
      onCreateEvent(form);
    }
    setForm(emptyForm);
    setImagePreview(null);
    setOpen(false);
  };

  const isEditing = !!editEvent;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="lg" className="gap-2 rounded-full px-6 font-semibold">
            <Plus className="w-5 h-5" />
            Create Event
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-display)" }} className="text-2xl">
            {isEditing ? "Edit Event" : "Create New Tech Event"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" placeholder="e.g. React Summit 2026" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="e.g. United States" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="e.g. San Francisco" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Venue / Address</Label>
            <Input id="location" placeholder="e.g. Moscone Center" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryGroups.map((group) => (
                  <div key={group.label}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{group.label}</div>
                    {group.items.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Event Image <span className="text-destructive">*</span></Label>
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                <button type="button" onClick={removeImage} className="absolute top-2 right-2 p-1 rounded-full bg-foreground/70 text-background hover:bg-foreground/90 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                {uploading ? (
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">Click to upload an image</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, WebP up to 5MB</p>
                  </>
                )}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration_link">Registration Link</Label>
            <Input id="registration_link" type="url" placeholder="https://..." value={form.registration_link} onChange={(e) => setForm({ ...form, registration_link: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Tell people about this tech event..." rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <Button type="submit" className="w-full rounded-full font-semibold" size="lg" disabled={uploading}>
            {isEditing ? "Save Changes" : "Publish Event"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
