import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  User,
  Target,
  GraduationCap,
  Briefcase,
  Building2,
  BookOpen,
  TrendingUp,
  Settings,
  LogOut,
  Shield,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const studentMenuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Academic Alignment", url: "/academic", icon: GraduationCap },
  { title: "Careers", url: "/careers", icon: Briefcase },
  { title: "Opportunities", url: "/opportunities", icon: Building2 },
  { title: "Resources", url: "/resources", icon: BookOpen },
  { title: "Progress", url: "/progress", icon: TrendingUp },
];

const adminMenuItems = [
  { title: "Admin Dashboard", url: "/admin", icon: Shield },
  { title: "Students", url: "/students", icon: Users },
  { title: "Careers", url: "/careers", icon: Briefcase },
  { title: "Opportunities", url: "/opportunities", icon: Building2 },
  { title: "Resources", url: "/resources", icon: BookOpen },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "admin";
  const menuItems = isAdmin ? adminMenuItems : studentMenuItems;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-semibold tracking-tight">
              Future Flow
            </span>
            <span className="text-xs text-muted-foreground">
              Academic Alignment
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-display text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarSeparator className="mb-4" />
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {user?.name ? getInitials(user.name) : "??"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium" data-testid="text-username">
              {user?.name || "Guest"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email || ""}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            data-testid="button-logout"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
