import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MyEvents from "./pages/MyEvents";
import ManageLinks from "./pages/ManageLinks";
import WeddingForm from "./pages/WeddingForm";
import BachelorForm from "./pages/BachelorForm";
import ChristmasForm from "./pages/ChristmasForm";
import RoseGoldTabsForm from "./pages/RoseGoldTabsForm";
import WeddingInvite from "./pages/WeddingInvite";
import EventTypeSelection from "./pages/EventTypeSelection";
import TemplateSelection from "./pages/TemplateSelection";
import WeddingTemplates from "./pages/WeddingTemplates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/my-events" element={<MyEvents />} />
          <Route path="/dashboard/manage-links/:weddingId" element={<ManageLinks />} />
          <Route path="/dashboard/select-event-type" element={<EventTypeSelection />} />
          <Route path="/dashboard/wedding-templates" element={<WeddingTemplates />} />
          <Route path="/dashboard/select-template/:eventType" element={<TemplateSelection />} />
          <Route path="/dashboard/create" element={<WeddingForm />} />
          <Route path="/dashboard/bachelor-form" element={<BachelorForm />} />
          <Route path="/dashboard/christmas-form" element={<ChristmasForm />} />
          <Route path="/dashboard/rose-gold-tabs-form" element={<RoseGoldTabsForm />} />
          <Route path="/dashboard/edit/:id" element={<WeddingForm />} />
          <Route path="/dashboard/edit-bachelor/:id" element={<BachelorForm />} />
          <Route path="/dashboard/edit-christmas/:id" element={<ChristmasForm />} />
          <Route path="/dashboard/edit-rose-gold-tabs/:id" element={<RoseGoldTabsForm />} />
          <Route path="/invite/preview" element={<WeddingInvite />} />
          <Route path="/invite/:slug/:linkSlug/:numberOfPersons" element={<WeddingInvite />} />
          <Route path="/invite/:slug" element={<WeddingInvite />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
