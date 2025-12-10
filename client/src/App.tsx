import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import ProfilePage from "@/pages/profile";
import GoalsPage from "@/pages/goals";
import CareersPage from "@/pages/careers";
import OpportunitiesPage from "@/pages/opportunities";
import ResourcesPage from "@/pages/resources";
import ProgressPage from "@/pages/progress";
import AcademicPage from "@/pages/academic";
import AdminPage from "@/pages/admin";
import StudentsPage from "@/pages/students";
import StudentDetailPage from "@/pages/student-detail";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/" component={() => {
        if (!user) return <Redirect to="/auth" />;
        // Route based on role: admin goes to admin panel by default, student to dashboard
        return user.role === "admin" ? <Redirect to="/admin" /> : <ProtectedRoute component={DashboardPage} />;
      }} />
      <Route path="/auth" component={() => <PublicRoute component={AuthPage} />} />
      {/* Admin has access to everything */}
      <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} />} />
      <Route path="/goals" component={() => <ProtectedRoute component={GoalsPage} />} />
      <Route path="/careers" component={() => <ProtectedRoute component={CareersPage} />} />
      <Route path="/careers/:id" component={() => <ProtectedRoute component={CareersPage} />} />
      <Route path="/opportunities" component={() => <ProtectedRoute component={OpportunitiesPage} />} />
      <Route path="/resources" component={() => <ProtectedRoute component={ResourcesPage} />} />
      <Route path="/progress" component={() => <ProtectedRoute component={ProgressPage} />} />
      <Route path="/academic" component={() => <ProtectedRoute component={AcademicPage} />} />
      <Route path="/admin" component={() => <AdminRoute component={AdminPage} />} />
      <Route path="/students" component={() => <AdminRoute component={StudentsPage} />} />
      <Route path="/students/:id" component={() => <AdminRoute component={StudentDetailPage} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
