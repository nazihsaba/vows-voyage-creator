import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, Edit, Trash2, ExternalLink, Link2, List, Eye, Loader2, CreditCard, Shield, AlertCircle } from "lucide-react";
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

const PUBLISH_FEE_USD = 1; // Fee for publishing an event

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

  useEffect(() => {
    checkUserAndFetchWeddings();
  }, []);

  // Handle payment callback from URL params
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const weddingId = searchParams.get('weddingId');
    
    if (paymentStatus && weddingId) {
      if (paymentStatus === 'success') {
        toast({
          title: "Payment Successful!",
          description: "Your event has been published and is now live.",
        });
        // Refresh weddings to show updated status
        fetchWeddings();
      } else if (paymentStatus === 'failed') {
        toast({
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again.",
          variant: "destructive",
        });
      }
      // Clear URL params
      navigate('/dashboard/my-events', { replace: true });
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

      const { data, error } = await supabase
        .from("weddings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWeddings(data || []);
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
  };

  const handlePaymentProceed = async () => {
    if (!publishingWeddingId) return;

    setProcessingPayment(true);
    setPaymentUrl(null);
    setPaymentError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const wedding = weddings.find(w => w.id === publishingWeddingId);
      
      const response = await supabase.functions.invoke('whish-pay-collect', {
        body: {
          weddingId: publishingWeddingId,
          amount: PUBLISH_FEE_USD,
          currency: 'USD',
          invoice: `Event publishing: ${wedding?.bride_name} & ${wedding?.groom_name}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create payment link');
      }

      const { collectUrl } = response.data;
      
      if (collectUrl) {
        // Redirect user to the Whish payment page
        window.location.href = collectUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      setPaymentError(error instanceof Error ? error.message : "We couldn't start the payment. Please try again.");
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
    return weddings.find(w => w.id === publishingWeddingId);
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">My Events</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/dashboard")}>Create Event</Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your events...</p>
          </div>
        ) : weddings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-2">No Events Yet</h2>
            <p className="text-muted-foreground mb-6">Create your first event invitation to get started</p>
            <Button onClick={() => navigate("/dashboard/select-event-type")}>Create Event</Button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupEventsByType(weddings)).map(
              ([eventType, events]) =>
                events.length > 0 && (
                  <section key={eventType}>
                    <div className="mb-6">
                      <h2 className="text-2xl font-serif font-bold text-foreground">{eventType}s</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {events.filter((e) => e.status === "published").length} published,{" "}
                        {events.filter((e) => e.status === "draft").length} draft
                      </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {events.map((wedding) => (
                        <Card
                          key={wedding.id}
                          className="shadow-soft hover:shadow-elegant transition-all relative rounded-[20px]"
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-1">
                                  {/* <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                                    {getEventType(wedding.template_type)}
                                  </span> */}
                                </div>
                                <CardTitle className="text-xl font-serif">
                                  {wedding.bride_name} & {wedding.groom_name}
                                </CardTitle>
                                <CardDescription>
                                  {new Date(wedding.wedding_date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </CardDescription>
                              </div>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${wedding.status === "published" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${wedding.status === "published" ? "bg-green-500" : "bg-amber-500"}`}
                                ></span>
                                {wedding.status === "published" ? "Live" : "Draft"}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {wedding.status === "draft" && (
                                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
                                  <p className="font-medium">Not published yet</p>
                                  <p className="text-xs mt-1">Edit and publish to generate invitation links</p>
                                </div>
                              )}

                              {wedding.status === "draft" && (
                                <Button className="w-full" onClick={() => handlePublishClick(wedding.id)}>
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Publish Event (${PUBLISH_FEE_USD})
                                </Button>
                              )}

                              {wedding.status === "published" && (
                                <>
                                  {!wedding.template_type?.includes("bachelor") ? (
                                    <>
                                      <Button
                                        variant="outline"
                                        className="w-full flex items-center justify-between rounded-full"
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
                                        className="w-full flex items-center justify-between rounded-full"
                                        onClick={() => navigate(`/dashboard/manage-links/${wedding.id}`)}
                                      >
                                        <span>Manage invitation Links</span>
                                        <List className="w-4 h-4" />
                                      </Button>
                                    </>
                                  ) : wedding.main_picture_url ? (
                                    <div className="relative rounded-lg overflow-hidden border border-border">
                                      <img
                                        src={wedding.main_picture_url}
                                        alt="Bachelor party card"
                                        className="w-full h-48 object-cover"
                                      />
                                    </div>
                                  ) : null}
                                </>
                              )}

                              <div className="mt-2 flex items-center justify-end gap-1.5 border-t border-dashed border-border/60 pt-3">
                                <div className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2 py-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => {
                                      let editPath = `/dashboard/edit/${wedding.id}`;

                                      if (wedding.template_type?.includes("bachelor")) {
                                        editPath = `/dashboard/edit-bachelor/${wedding.id}`;
                                      } else if (wedding.template_type?.includes("christmas")) {
                                        editPath = `/dashboard/edit-christmas/${wedding.id}`;
                                      } else if (wedding.template_type === "rose-gold-tabs") {
                                        editPath = `/dashboard/edit-rose-gold-tabs/${wedding.id}`;
                                      }

                                      navigate(editPath);
                                    }}
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>

                                  {wedding.status === "published" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full"
                                      onClick={() => window.open(`/invite/${wedding.slug}`, "_blank")}
                                      title="View Invitation"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteId(wedding.id)}
                                    title="Delete"
                                    className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
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

      {/* Payment Confirmation Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={(open) => {
        if (!processingPayment) {
          if (!open) handleClosePaymentDialog();
          else setPaymentDialogOpen(open);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Pay to Publish Event
            </DialogTitle>
            <DialogDescription className="pt-2">
              Complete payment to make your event accessible to guests.
            </DialogDescription>
          </DialogHeader>

          {/* Error State */}
          {paymentError && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Payment Error</p>
                <p className="text-xs text-destructive/80 mt-1">{paymentError}</p>
              </div>
            </div>
          )}
          
          {/* Order Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="text-sm font-medium text-foreground">Order Summary</div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item</span>
                <span>Event Publishing</span>
              </div>
              
              {getPublishingWedding() && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event</span>
                  <span className="font-medium text-right max-w-[180px] truncate">
                    {getPublishingWedding()?.bride_name} & {getPublishingWedding()?.groom_name}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold text-primary text-lg">${PUBLISH_FEE_USD}.00 USD</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Whish Pay</p>
                <p className="text-xs text-muted-foreground">Pay with your Whish balance</p>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>You'll be redirected to Whish to complete the payment securely.</span>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleClosePaymentDialog}
              disabled={processingPayment}
              className="sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePaymentProceed}
              disabled={processingPayment}
              className="gap-2 sm:flex-1"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating payment...
                </>
              ) : (
                <>
                  Continue to Whish
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyEvents;
