import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  Link2,
  List,
  Eye,
  Loader2,
  CreditCard,
  Shield,
  AlertCircle,
  MoreVertical,
  Share2,
} from "lucide-react";
import { ShareEventDialog } from "@/components/ShareEventDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { GenerateLinkDialog } from "@/components/GenerateLinkDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Wedding {
  id: string;
  user_id: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  status: string;
  slug: string;
  template_type: string;
  created_at: string;
  main_picture_url?: string;
  payment_status?: string;
  payment_external_id?: string;
}

const PUBLISH_FEE_USD = 100; // Fee for publishing an event

const getEventType = (templateType: string): string => {
  if (templateType?.includes("bachelor")) return "Bachelor Party";
  if (templateType?.includes("christmas") || templateType?.includes("birthday")) return "Christmas Dinner";
  return "Wedding";
};

const groupEventsByType = (events: Wedding[]) => {
  const grouped: Record<string, Wedding[]> = {
    Wedding: [],
    "Bachelor Party": [],
    "Christmas Dinner": [],
  };

  events.forEach((event) => {
    const type = getEventType(event.template_type);
    grouped[type].push(event);
  });

  return grouped;
};

const MyEvents = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [generateLinkOpen, setGenerateLinkOpen] = useState(false);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string | null>(null);
  const [selectedWeddingSlug, setSelectedWeddingSlug] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [publishingWeddingId, setPublishingWeddingId] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareWeddingId, setShareWeddingId] = useState<string | null>(null);
  const [shareCounts, setShareCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    checkUserAndFetchWeddings();
  }, []);

  // Handle payment callback from URL params
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const weddingId = searchParams.get("weddingId");

    if (paymentStatus && weddingId) {
      if (paymentStatus === "success") {
        toast({
          title: "Payment Successful!",
          description: "Your event has been published and is now live.",
        });
        // Refresh weddings to show updated status
        fetchWeddings();
      } else if (paymentStatus === "failed") {
        toast({
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again.",
          variant: "destructive",
        });
      }
      // Clear URL params
      navigate("/dashboard/my-events", { replace: true });
    }
  }, [searchParams]);

  const checkUserAndFetchWeddings = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    await fetchWeddings();
  };

  const fetchWeddings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      setCurrentUserId(user.id);

      // Fetch owned weddings
      const { data: ownedData, error: ownedError } = await supabase
        .from("weddings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ownedError) throw ownedError;

      // Fetch shared weddings via wedding_shares
      const { data: shares } = await supabase
        .from("wedding_shares")
        .select("wedding_id")
        .eq("shared_with_user_id", user.id);

      let sharedWeddings: Wedding[] = [];
      if (shares && shares.length > 0) {
        const sharedIds = shares.map((s: any) => s.wedding_id);
        const { data: sharedData } = await supabase
          .from("weddings")
          .select("*")
          .in("id", sharedIds)
          .order("created_at", { ascending: false });
        sharedWeddings = (sharedData || []) as Wedding[];
      }

      // Merge and deduplicate
      const allWeddings = [...(ownedData || []), ...sharedWeddings];
      const uniqueMap = new Map<string, Wedding>();
      allWeddings.forEach((w) => uniqueMap.set(w.id, w as Wedding));
      setWeddings(Array.from(uniqueMap.values()));

      // Fetch share counts for ALL visible weddings
      const allIds = Array.from(uniqueMap.keys());
      if (allIds.length > 0) {
        const { data: allShares } = await supabase
          .from("wedding_shares")
          .select("wedding_id")
          .in("wedding_id", allIds);

        const counts: Record<string, number> = {};
        (allShares || []).forEach((s: any) => {
          counts[s.wedding_id] = (counts[s.wedding_id] || 0) + 1;
        });
        setShareCounts(counts);
      }
    } catch (error) {
      console.error("Error fetching weddings:", error);
      toast({
        title: "Error",
        description: "Failed to load your events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("weddings").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });

      setWeddings(weddings.filter((w) => w.id !== id));
    } catch (error) {
      console.error("Error deleting wedding:", error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  const handlePublishClick = (id: string) => {
    setPublishingWeddingId(id);
    setPaymentDialogOpen(true);
    setPaymentUrl(null);
    setPaymentError(null);
  };

  const handlePaymentProceed = async () => {
    if (!publishingWeddingId) return;
    setProcessingPayment(true);
    setPaymentError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("whish-pay-collect", {
        body: {
          weddingId: publishingWeddingId,
          amount: PUBLISH_FEE_USD,
          currency: "USD",
          invoice: `Event publishing fee - $${PUBLISH_FEE_USD}`,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.collectUrl) {
        setPaymentUrl(data.collectUrl);
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentError(error.message || "Failed to create payment link");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setPublishingWeddingId(null);
    setPaymentUrl(null);
    setPaymentError(null);
  };

  const getPublishingWedding = () => {
    return weddings.find((w) => w.id === publishingWeddingId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="bg-white/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-foreground">My Events</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Manage your invitations</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => navigate("/dashboard")}
              className="rounded-full px-4 sm:px-5 shadow-sm hover:shadow-md transition-all text-sm"
            >
              Create Event
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="rounded-full border-border/60 hover:bg-muted/50"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground">Loading your events...</p>
          </div>
        ) : weddings.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-5">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold mb-2">No Events Yet</h2>
            <p className="text-muted-foreground mb-6 text-sm">Create your first event invitation to get started</p>
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-14">
            {Object.entries(groupEventsByType(weddings)).map(
              ([eventType, events]) =>
                events.length > 0 && (
                  <section key={eventType}>
                    <div className="mb-6 sm:mb-8 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg sm:text-xl font-serif font-bold text-foreground">{eventType}s</h2>
                        <div className="flex items-center gap-3 mt-1">
                          {events.filter((e) => e.status === "published").length > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              {events.filter((e) => e.status === "published").length} published
                            </span>
                          )}
                          {events.filter((e) => e.status === "draft").length > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              {events.filter((e) => e.status === "draft").length} draft
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {events.map((wedding) => (
                        <Card
                          key={wedding.id}
                          className="group border-0 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
                        >
                          <CardHeader className="p-5 pb-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg font-['great-vibes'] truncate">
                                  {wedding.bride_name} & {wedding.groom_name}
                                </CardTitle>
                                <CardDescription className="mt-1 text-sm">
                                  {new Date(wedding.wedding_date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </CardDescription>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium rounded-full transition-colors ${
                                    wedding.status === "published"
                                      ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${wedding.status === "published" ? "bg-green-500" : "bg-amber-500"}`}
                                  ></span>
                                  {wedding.status === "published" ? "Live" : "Draft"}
                                </span>
                                {(shareCounts[wedding.id] ?? 0) < 1 && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-muted/60">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setShareWeddingId(wedding.id);
                                          setShareDialogOpen(true);
                                        }}
                                      >
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share with user
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="px-5 pb-5 pt-0">
                            <div className="space-y-3">
                              {wedding.status === "draft" && (
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-3 text-sm text-amber-800">
                                  <p className="font-medium text-xs">Not published yet</p>
                                  <p className="text-[11px] mt-0.5 text-amber-600">
                                    Edit and publish to generate invitation links
                                  </p>
                                </div>
                              )}

                              {wedding.status === "draft" && (
                                <Button
                                  className="w-full rounded-full shadow-sm hover:shadow-md transition-all"
                                  onClick={() => handlePublishClick(wedding.id)}
                                >
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Publish Event (${PUBLISH_FEE_USD})
                                </Button>
                              )}

                              {wedding.status === "published" && (
                                <>
                                  {!wedding.template_type?.includes("bachelor") ? (
                                    <div className="space-y-2">
                                      <Button
                                        variant="outline"
                                        className="w-full flex items-center justify-between rounded-full border-border/60 hover:bg-muted/50 hover:border-primary/30 transition-all text-sm"
                                        onClick={() => {
                                          setSelectedWeddingId(wedding.id);
                                          setSelectedWeddingSlug(wedding.slug);
                                          setGenerateLinkOpen(true);
                                        }}
                                      >
                                        <span>Generate Invitation Link</span>
                                        <Link2 className="w-4 h-4" />
                                      </Button>

                                      <Button
                                        variant="outline"
                                        className="w-full flex items-center justify-between rounded-full border-border/60 hover:bg-muted/50 hover:border-primary/30 transition-all text-sm"
                                        onClick={() => navigate(`/dashboard/manage-links/${wedding.id}`)}
                                      >
                                        <span>Manage Invitation Links</span>
                                        <List className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ) : wedding.main_picture_url ? (
                                    <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-sm">
                                      <img
                                        src={wedding.main_picture_url}
                                        alt="Bachelor party card"
                                        className="w-full h-44 object-cover"
                                      />
                                    </div>
                                  ) : null}
                                </>
                              )}

                              <div className="flex items-center justify-end gap-1 border-t border-border/40 pt-3 mt-3">
                                <TooltipProvider>
                                  <div className="inline-flex items-center gap-0.5 rounded-full bg-muted/50 p-1">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm transition-all"
                                          onClick={() => {
                                            let editPath = `/dashboard/edit/${wedding.id}`;
                                            if (wedding.template_type?.includes("bachelor")) {
                                              editPath = `/dashboard/edit-bachelor/${wedding.id}`;
                                            } else if (wedding.template_type?.includes("christmas")) {
                                              editPath = `/dashboard/edit-christmas/${wedding.id}`;
                                            } else if (wedding.template_type === "rose-gold-tabs") {
                                              editPath = `/dashboard/edit-rose-gold-tabs/${wedding.id}`;
                                            }
                                            navigate(editPath, { state: { from: "my-events" } });
                                          }}
                                        >
                                          <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Edit</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm transition-all"
                                          onClick={() => setPreviewSlug(wedding.slug)}
                                        >
                                          <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Preview</TooltipContent>
                                    </Tooltip>
                                    {wedding.user_id === currentUserId && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteId(wedding.id)}
                                            className="h-8 w-8 rounded-full text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Delete</TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                </TooltipProvider>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                ),
            )}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your event and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedWeddingId && selectedWeddingSlug && (
        <GenerateLinkDialog
          open={generateLinkOpen}
          onOpenChange={setGenerateLinkOpen}
          weddingId={selectedWeddingId}
          weddingSlug={selectedWeddingSlug}
          onSuccess={() => {
            toast({
              title: "Success",
              description: "Link created successfully! Navigate to Manage Links to view it.",
            });
          }}
        />
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={handleClosePaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Publish Event
            </DialogTitle>
            <DialogDescription>
              {getPublishingWedding() && (
                <span>
                  Publish{" "}
                  <strong>
                    {getPublishingWedding()!.bride_name} & {getPublishingWedding()!.groom_name}
                  </strong>
                  's event
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {!paymentUrl && !paymentError && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Publishing fee</span>
                  <span className="font-semibold">${PUBLISH_FEE_USD} USD</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Payment is processed securely via Whish Pay. Once confirmed, your event will be live.
              </p>
            </div>
          )}

          {paymentUrl && (
            <div className="space-y-4 text-center">
              <div className="bg-green-50 text-green-700 rounded-xl p-4 text-sm">
                Payment link created! Click below to complete your payment.
              </div>
              <Button asChild className="w-full rounded-full">
                <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now
                </a>
              </Button>
            </div>
          )}

          {paymentError && (
            <div className="space-y-4">
              <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{paymentError}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            {!paymentUrl && !paymentError && (
              <Button onClick={handlePaymentProceed} disabled={processingPayment} className="w-full rounded-full">
                {processingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            )}
            {paymentError && (
              <Button onClick={handlePaymentProceed} className="w-full rounded-full">
                Try Again
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewSlug} onOpenChange={(open) => !open && setPreviewSlug(null)}>
        <DialogContent className="p-0 gap-0 border-0 overflow-hidden w-full h-[100dvh] max-w-none max-h-none top-0 left-0 translate-x-0 translate-y-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[95vw] sm:h-[95vh] sm:rounded-lg">
          <div className="absolute top-3 right-3 z-10">
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 rounded-full shadow-md"
              onClick={() => setPreviewSlug(null)}
            >
              ✕
            </Button>
          </div>
          {previewSlug && (
            <iframe
              src={`/invite/${previewSlug}?preview=true&readOnly=true`}
              className="w-full h-full border-0"
              title="Invitation Preview"
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Share Event Dialog */}
      {shareWeddingId && (
        <ShareEventDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          weddingId={shareWeddingId}
          onSuccess={() => fetchWeddings()}
        />
      )}
    </div>
  );
};

export default MyEvents;
