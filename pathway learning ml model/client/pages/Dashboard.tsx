import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import DashboardPreview from "@/components/sections/DashboardPreview";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, Lock } from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/signin");
  };

  const handleSignUp = () => {
    navigate("/signin?mode=signup");
  };

  // Show loading state
  if (loading) {
    return (
      <main className="container mx-auto flex min-h-[60vh] items-center justify-center py-16">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          <p className="mt-4 text-sm text-foreground/70">Loading...</p>
        </div>
      </main>
    );
  }

  // CRITICAL: If user is not logged in, show ONLY the authentication dialog
  // NO dashboard content, NO charts, NO data - NOTHING should be visible
  // This early return prevents ANY dashboard content from rendering
  if (!user || user === null) {
    return (
      <>
        {/* Auth Required Dialog - Modal overlay with full screen blocking */}
        <Dialog 
          open={true}
          modal={true}
          onOpenChange={(open) => {
            // If user closes dialog (without signing in), redirect to home
            if (!open) {
              navigate("/");
            }
          }}
        >
          <DialogContent 
            className="sm:max-w-[425px]"
            onEscapeKeyDown={(e) => {
              // Allow ESC to close, but redirect to home
              e.preventDefault();
              navigate("/");
            }}
            onPointerDownOutside={(e) => {
              // Allow clicking outside to close, but redirect to home
              e.preventDefault();
              navigate("/");
            }}
          >
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
                <Lock className="h-6 w-6 text-cyan-500" />
              </div>
              <DialogTitle className="text-center text-2xl">
                Authentication Required
              </DialogTitle>
              <DialogDescription className="text-center">
                You need to sign in or create an account to access your personalized
                learning dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                <Button
                  onClick={handleSignIn}
                  className="w-full"
                  size="lg"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button
                  onClick={handleSignUp}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </Button>
              </div>
            </div>
            <DialogFooter className="sm:justify-center">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Empty div to prevent any content from showing */}
        <div style={{ display: 'none' }} />
      </>
    );
  }

  // User is authenticated - show dashboard content
  return (
    <main>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto py-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-2xl font-extrabold text-transparent">
              Welcome back, {user.displayName || user.email}!
            </h1>
            <p className="mt-1 text-sm text-foreground/70">
              Here's your personalized learning dashboard
            </p>
          </div>
        </div>
        <DashboardPreview />
      </motion.div>
    </main>
  );
}

