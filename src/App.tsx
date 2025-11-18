import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Chatbot } from "@/components/Chatbot";
import { RealtimeNotificationSystem } from "@/components/RealtimeNotificationSystem";
import { MobileNavigation } from "@/components/MobileNavigation";
import Dashboard from "./pages/Dashboard";
import Vendors from "./pages/Vendors";
import RegistrationTemplates from "./pages/RegistrationTemplates";
import CategoryManagement from "./pages/CategoryManagement";
import PurchaseOrderManagement from "./pages/PurchaseOrderManagement";
import QuotationManagement from "./pages/QuotationManagement";
import ProductRegistration from "./pages/ProductRegistration";
import PurchaseManagement from "./pages/PurchaseManagement";
import OutboundManagement from "./pages/OutboundManagement";
import SalesManagement from "./pages/SalesManagement";
import Profile from "./pages/Profile";
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import ProductDetail from "./pages/ProductDetail";
import Inventory from "./pages/Inventory";
import Billing from "./pages/Billing";
import Shipping from "./pages/Shipping";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex-1">
                <div className="fixed top-4 right-4 z-50 flex gap-2">
                  <RealtimeNotificationSystem />
                </div>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/registration-templates" element={<RegistrationTemplates />} />
                  <Route path="/category-management" element={<CategoryManagement />} />
                  <Route path="/purchase-order-management" element={<PurchaseOrderManagement />} />
                  <Route path="/quotation-management" element={<QuotationManagement />} />
                  <Route path="/product-registration" element={<ProductRegistration />} />
                  <Route path="/products" element={<Index />} />
                  <Route path="/purchase" element={<PurchaseManagement />} />
                  <Route path="/outbound" element={<OutboundManagement />} />
                  <Route path="/sales" element={<SalesManagement />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/billing" element={<Billing />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
            <Chatbot />
            <MobileNavigation />
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
