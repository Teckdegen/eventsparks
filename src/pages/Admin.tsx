import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreateEventDialog, type EventFormData } from "@/components/CreateEventDialog";
import { EventCard } from "@/components/EventCard";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, Trash2, Pencil, Users, Mail } from "lucide-react";
import { AdminAnalytics } from "@/components/AdminAnalytics";
import logo from "@/assets/eventsparks-logo.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const fetchEvents = async () => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

const fetchSubscriberCount = async () => {
  const { count, error } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
};

const fetchSubscribers = async () => {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("email, subscribed_at")
    .order("subscribed_at", { ascending: false });
  if (error) throw error;
  return data as { email: string; subscribed_at: string }[];
};

const Admin = () => {
  const { isAdmin, loading, signIn, signOut } = useAuth();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<(EventFormData & { id: string }) | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [subscribersOpen, setSubscribersOpen] = useState(false);

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    enabled: isAdmin,
  });

  const { data: subscriberCount = 0 } = useQuery({
    queryKey: ["subscriber-count"],
    queryFn: fetchSubscriberCount,
    enabled: isAdmin,
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ["subscribers"],
    queryFn: fetchSubscribers,
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: async (event: EventFormData) => {
      const { error } = await supabase.from("events").insert({
        title: event.title,
        date: event.date,
        location: event.location,
        description: event.description || null,
        category: event.category,
        image: event.image || null,
        country: event.country || null,
        city: event.city || null,
        registration_link: event.registration_link || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event published!");
    },
    onError: () => toast.error("Failed to create event."),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...event }: EventFormData & { id: string }) => {
      const { error } = await supabase
        .from("events")
        .update({
          title: event.title,
          date: event.date,
          location: event.location,
          description: event.description || null,
          category: event.category,
          image: event.image || null,
          country: event.country || null,
          city: event.city || null,
          registration_link: event.registration_link || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event updated!");
      setEditingEvent(null);
      setEditOpen(false);
    },
    onError: () => toast.error("Failed to update event."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted.");
    },
    onError: () => toast.error("Failed to delete event."),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const success = signIn(email, password);
    if (!success) {
      toast.error("Invalid credentials");
    }
    setLoginLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <img src={logo} alt="EventSparks" className="h-12 mb-8" />
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
              Admin Login
            </CardTitle>
            <CardDescription>Enter your admin credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-full" size="lg" disabled={loginLoading}>
                {loginLoading ? "Please wait..." : "Sign In"}
              </Button>
            </form>
            <Link to="/" className="block text-center text-sm text-muted-foreground mt-4 hover:text-foreground">
              ← Back to events
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 md:px-10 border-b border-border/50">
        <Link to="/">
          <img src={logo} alt="EventSparks" className="h-10 md:h-12" />
        </Link>
        <div className="flex items-center gap-3">
          <CreateEventDialog onCreateEvent={(e) => createMutation.mutate(e)} />
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 rounded-full">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </nav>

      <section className="px-4 py-8 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl tracking-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">{events.length} event{events.length !== 1 ? "s" : ""} published</p>
          </div>
          <button
            onClick={() => setSubscribersOpen(true)}
            className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full hover:bg-muted/80 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>{subscriberCount} subscriber{subscriberCount !== 1 ? "s" : ""}</span>
          </button>
        </div>

        <AdminAnalytics events={events} subscriberCount={subscriberCount} />

        {/* Subscribers Dialog */}
        <Dialog open={subscribersOpen} onOpenChange={setSubscribersOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Newsletter Subscribers
              </DialogTitle>
              <DialogDescription>
                {subscribers.length} total subscriber{subscribers.length !== 1 ? "s" : ""}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-2">
                {subscribers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No subscribers yet.</p>
                )}
                {subscribers.map((sub, idx) => (
                  <div
                    key={sub.email}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium">{sub.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sub.subscribed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Edit dialog */}
        {editingEvent && (
          <CreateEventDialog
            onCreateEvent={() => {}}
            editEvent={editingEvent}
            onEditEvent={(data) => updateMutation.mutate({ ...data, id: editingEvent.id })}
            open={editOpen}
            onOpenChange={(val) => {
              setEditOpen(val);
              if (!val) setEditingEvent(null);
            }}
            trigger={<span />}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <div key={event.id} className="relative group">
              <EventCard event={event} />
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 rounded-full shadow-md"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingEvent({
                      id: event.id,
                      title: event.title,
                      date: event.date,
                      location: event.location,
                      description: event.description || "",
                      category: event.category,
                      image: event.image || "",
                      country: event.country || "",
                      city: event.city || "",
                      registration_link: event.registration_link || "",
                    });
                    setEditOpen(true);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0 rounded-full shadow-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{event.title}"?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(event.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Admin;
