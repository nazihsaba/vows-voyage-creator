import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ResetPassword from "./pages/ResetPassword";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MyEvents from "./pages/MyEvents";
import ManageLinks from "./pages/ManageLinks";
import WeddingForm from "./pages/WeddingForm";
import WeddingInvite from "./pages/WeddingInvite";
import SeatingLookup from "./pages/SeatingLookup";

import TemplateSelection from "./pages/TemplateSelection";
import WeddingTemplates from "./pages/WeddingTemplates";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import VeritePreview from "./components/templates/VeritePreview";

import ScrollToTop from "./components/ScrollToTop";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/my-events" element={<MyEvents />} />
          <Route path="/dashboard/manage-links/:weddingId" element={<ManageLinks />} />
          
          <Route path="/dashboard/wedding-templates" element={<WeddingTemplates />} />
          <Route path="/dashboard/select-template/:eventType" element={<TemplateSelection />} />
          <Route path="/dashboard/create" element={<WeddingForm />} />
          <Route path="/dashboard/aura-form" element={<WeddingForm />} />
          <Route path="/dashboard/verite-form" element={<WeddingForm />} />
          <Route path="/dashboard/eclat-form" element={<WeddingForm />} />
          <Route path="/dashboard/grace-form" element={<WeddingForm />} />
          <Route path="/dashboard/lumiere-form" element={<WeddingForm />} />
          <Route path="/dashboard/etoile-form" element={<WeddingForm />} />
          
          <Route path="/dashboard/edit/:id" element={<WeddingForm />} />
          <Route path="/invite/preview" element={<WeddingInvite />} />
          <Route path="/invite/:slug/:linkSlug/:numberOfPersons" element={<WeddingInvite />} />
          <Route path="/invite/:slug" element={<WeddingInvite />} />
          <Route path="/seating/:weddingSlug" element={<SeatingLookup />} />
          <Route path="/preview/modern-romance" element={<VeritePreview />} />
          
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
