import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { getPendingPRCount } from "@/lib/supabaseService";
import { Settings, User, LogOut, Home, BookOpen, Calendar, UserCheck, Upload, Menu } from "lucide-react";
import { Breadcrumbs, Crumb } from "@/components/Breadcrumbs";
import { useTimetableStore } from "@/store/timetableStore";

export interface AdminNavItem {
  label: string;
  href: string;
  badge?: number;
  icon?: React.ReactNode;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  department_id: string;
  is_active: boolean;
}

const AdminNavbar = () => {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const selection = useTimetableStore((s) => s.selection);

  const navItems: AdminNavItem[] = [
    { label: "Home", href: "/admin", icon: <Home className="h-4 w-4" /> },
    { label: "Subjects", href: "/subjects", icon: <BookOpen className="h-4 w-4" /> },
    { label: "Timetable", href: "/timetable", icon: <Calendar className="h-4 w-4" /> },

    { label: "Faculty", href: "/admin/faculty", icon: <UserCheck className="h-4 w-4" /> },
    { label: "Lab Allocation", href: "/lab", icon: <Upload className="h-4 w-4" /> },
  ];

  useEffect(() => {
    // Load admin user data from localStorage
    const adminData = localStorage.getItem("adminUser");
    if (adminData) {
      try {
        const parsed = JSON.parse(adminData);
        if (parsed && parsed.email) {
            setAdminUser(parsed);
        } else {
            console.error('Invalid admin data structure');
            localStorage.removeItem("adminUser");
            navigate("/admin-login", { replace: true });
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem("adminUser");
        navigate("/admin-login", { replace: true });
      }
    } else {
      navigate("/admin-login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await getPendingPRCount();
        if (mounted) setPendingCount(c);
      } catch {}
    })();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable_pull_requests' }, async () => {
        try {
          const c = await getPendingPRCount();
          setPendingCount(c);
        } catch {}
      })
      .subscribe();

    return () => {
      mounted = false;
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

  const handleSuperAdminLogin = () => {
    navigate("/login");
  };

  const handleFacultyLogin = () => {
    navigate("/faculty");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    navigate("/admin-login", { replace: true });
  };

  // Generate breadcrumbs based on current route
  const generateBreadcrumbs = (): Crumb[] => {
    const path = location.pathname;
    const breadcrumbs: Crumb[] = [];

    if (path === "/admin") {
      // No breadcrumbs on admin landing page
      return [];
    } else if (path === "/subjects") {
      breadcrumbs.push({ label: "Home", href: "/admin" });
      breadcrumbs.push({ label: "Subjects" });
    } else if (path === "/timetable") {
      breadcrumbs.push({ label: "Home", href: "/admin" });
      breadcrumbs.push({ label: "Subjects", href: "/subjects" });
      breadcrumbs.push({ label: "Timetable" });
    } else if (path === "/lab") {
      breadcrumbs.push({ label: "Home", href: "/admin" });
      breadcrumbs.push({ label: "Lab" });
    } else if (path === "/pull-requests") {
      breadcrumbs.push({ label: "Home", href: "/admin" });
      breadcrumbs.push({ label: "Pull Requests" });
    } else if (path.startsWith("/pull-requests/")) {
      breadcrumbs.push({ label: "Home", href: "/admin" });
      breadcrumbs.push({ label: "Pull Requests", href: "/pull-requests" });
      breadcrumbs.push({ label: "PR Details" });
    } else if (path === "/current-timetables") {
      breadcrumbs.push({ label: "Home", href: "/admin" });
      breadcrumbs.push({ label: "Current Timetables" });
    } else if (path === "/csv-upload") {
      breadcrumbs.push({ label: "Home", href: "/admin" });
      breadcrumbs.push({ label: "import" });

    } else if (path === "/admin/faculty") {
      breadcrumbs.push({ label: "Home", href: "/admin" });
      breadcrumbs.push({ label: "Faculty" });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const linkBase = "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted w-full";

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-white/10 px-6 bg-slate-900/50">
        <Link to="/admin" className="font-semibold text-lg text-white">
          AI Time Portal
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 bg-slate-900/30">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => isActive ? `${linkBase} bg-white/10 text-blue-200` : `${linkBase} text-blue-100 hover:bg-white/5`}
            >
              {item.icon}
              <span>{item.label}</span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <Badge variant="secondary" className="ml-auto bg-purple-600 text-white">{item.badge}</Badge>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Current Selection Info */}
      {(selection.department || selection.year || selection.section) && (
        <div className="border-t border-white/10 px-3 py-3 bg-slate-900/30">
          <div className="text-xs text-blue-300 mb-2 font-medium">Current Selection</div>
          <div className="text-sm space-y-1 text-white">
            {selection.department && <div className="font-medium">{selection.department}</div>}
            {selection.year && <div>Year {selection.year}</div>}
            {selection.section && <div>Section {selection.section}</div>}
          </div>
        </div>
      )}

      {/* Role Badge */}
      <div className="border-t border-white/10 px-3 py-3 bg-slate-900/30">
        <Badge className="w-full justify-center uppercase tracking-wide text-[10px] font-medium px-2.5 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          Admin
        </Badge>
      </div>

      {/* User Profile */}
      <div className="border-t border-white/10 p-3 bg-slate-900/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start h-auto p-2 text-white hover:bg-white/10">
              <div className="flex items-center space-x-2 w-full">
                <User className="h-4 w-4" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium truncate">
                    {adminUser?.name || 'Profile'}
                  </div>
                  <div className="text-xs text-blue-300 truncate">
                    {adminUser?.email}
                  </div>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-white/20">
            <div className="px-2 py-1.5 text-sm">
              <div className="font-medium text-white">{adminUser?.name}</div>
              <div className="text-blue-300">{adminUser?.email}</div>
            </div>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={handleSuperAdminLogin} className="flex items-center space-x-2 text-white hover:bg-white/10">
              <Settings className="h-4 w-4" />
              <span className="font-medium">Super Admin Console</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleFacultyLogin} className="flex items-center space-x-2 text-white hover:bg-white/10">
              <UserCheck className="h-4 w-4" />
              <span className="font-medium">Faculty Console</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-white hover:bg-white/10">
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-slate-900 border-white/20">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <Link to="/admin" className="font-semibold text-white">
            AI Time Portal
          </Link>

          <div className="flex items-center gap-2">
            {/* Role Pill */}
            <Badge className="uppercase tracking-wide text-[10px] font-medium px-2.5 py-1 hidden sm:inline-flex bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
              Admin
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-white/20">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium text-white">{adminUser?.name}</div>
                  <div className="text-blue-300">{adminUser?.email}</div>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleSuperAdminLogin} className="text-white hover:bg-white/10">
                  <Settings className="h-4 w-4 mr-2" />
                  Super Admin Console
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleFacultyLogin} className="text-white hover:bg-white/10">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Faculty Console
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleLogout} className="text-white hover:bg-white/10">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="border-t border-white/10 bg-slate-800/30 px-4 py-2">
            <Breadcrumbs segments={breadcrumbs} />
          </div>
        )}
      </header>

      {/* Desktop Sidebar - Responsive width */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-72 lg:w-80 md:flex-col md:border-r md:border-white/10 md:bg-slate-900">
        <SidebarContent />
      </aside>

      {/* Desktop Breadcrumbs - Responsive positioning */}
      {breadcrumbs.length > 0 && (
        <div className="hidden md:block md:fixed md:top-0 md:left-72 lg:left-80 md:right-0 md:z-20 md:border-b md:border-white/10 md:bg-slate-800/30 md:px-6 md:py-3">
          <Breadcrumbs segments={breadcrumbs} />
        </div>
      )}
    </>
  );
};

export default AdminNavbar;
