import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Goals from "./pages/Goals";
import Videos from "./pages/Videos";
import Mentorship from "./pages/Mentorship";
import LearningPath from "./pages/LearningPath";
import Community from "./pages/Community";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import ViewUsers from "./pages/ViewUsers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/users" element={<ViewUsers />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/mentorship" element={<Mentorship />} />
              <Route path="/learning-path" element={<LearningPath />} />
              <Route path="/community" element={<Community />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

// Avoid calling createRoot multiple times (Vite HMR). Reuse existing root when possible.
const container = document.getElementById("root");
if (container) {
  const win = window as any;
  if (!win.__APP_ROOT__) {
    win.__APP_ROOT__ = createRoot(container);
  }
  win.__APP_ROOT__.render(<App />);
}
