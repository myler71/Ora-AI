import { Bell, CircleUserRound, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { useMeQuery } from "../queries/user.query";
import { AuthDialog } from "./AuthDialog";
import { Button } from "./Button";
import Logo from "./Logo";
import clsx from "clsx";

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState<AuthView>("register");
  const [notifOpen, setNotifOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken"),
  );
  const { data: meResponse } = useMeQuery(isLoggedIn);

  const isActive = (path: string) => location.pathname === path;
  const user = meResponse?.user ?? meResponse?.data;

  useEffect(() => {
    const syncAuthState = () => {
      setIsLoggedIn(!!localStorage.getItem("accessToken"));
    };

    window.addEventListener("storage", syncAuthState);
    window.addEventListener("auth-changed", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("auth-changed", syncAuthState);
    };
  }, []);

  useEffect(() => {
    const openAuthFromEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ view?: AuthView }>;
      setAuthInitialView(customEvent.detail?.view ?? "login");
      setAuthDialogOpen(true);
    };

    window.addEventListener("open-auth-dialog", openAuthFromEvent);
    return () =>
      window.removeEventListener("open-auth-dialog", openAuthFromEvent);
  }, []);

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100",
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-3.5">
        <div className="flex items-center justify-between">
          <Logo />

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/"
              className={`transition-colors ${isActive("/") ? "text-[#3FA9F5]" : "text-slate-600 hover:text-[#3FA9F5]"}`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`transition-colors ${isActive("/dashboard") ? "text-[#3FA9F5]" : "text-slate-600 hover:text-[#3FA9F5]"}`}
            >
              Dashboard
            </Link>
            <Link
              to="/patients"
              className={`transition-colors ${isActive("/patients") ? "text-[#3FA9F5]" : "text-slate-600 hover:text-[#3FA9F5]"}`}
            >
              Patients
            </Link>
            <Link
              to="/chat"
              className={`transition-colors ${isActive("/chat") ? "text-[#3FA9F5]" : "text-slate-600 hover:text-[#3FA9F5]"}`}
            >
              Chat
            </Link>
            <Link
              to="/calendar"
              className={`transition-colors ${isActive("/calendar") ? "text-[#3FA9F5]" : "text-slate-600 hover:text-[#3FA9F5]"}`}
            >
              Calendar
            </Link>
            <Link
              to="/features"
              className={`transition-colors ${isActive("/features") ? "text-[#3FA9F5]" : "text-slate-600 hover:text-[#3FA9F5]"}`}
            >
              Features
            </Link>
            <Link
              to="/blogs"
              className={`transition-colors ${isActive("/blogs") ? "text-[#3FA9F5]" : "text-slate-600 hover:text-[#3FA9F5]"}`}
            >
              Blogs
            </Link>
            <Link to="/ai-tool">
              <Button size="sm">Try AI Scan</Button>
            </Link>
            {isLoggedIn && user ? (
              <div className="flex items-center gap-3 ml-2 relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative text-slate-600 hover:text-blue-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
                </button>

                {/* Interactive Notification Center Popover */}
                {notifOpen && (
                  <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                      <span className="font-bold text-slate-900 text-sm">Clinical Notification Center</span>
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        2 New
                      </span>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
                        <div className="font-bold text-slate-900">Sara Smith — Appointment Today</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">Tooth 36 examination at 9:30 AM</div>
                        <span className="text-[9px] text-blue-600 font-semibold block mt-1">Checked In</span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="font-bold text-slate-900">Tooth 36 AI Analysis Ready</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">Mild Caries report waiting for doctor review</div>
                        <span className="text-[9px] text-slate-400 block mt-1">10 mins ago</span>
                      </div>

                      <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100">
                        <div className="font-bold text-rose-900">Low Stock Alert: Composite Resin</div>
                        <div className="text-[11px] text-rose-700 mt-0.5">Qty: 4 (Threshold: 10)</div>
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="text-blue-600 font-bold text-[11px] hover:underline"
                      >
                        Close Notification Center
                      </button>
                    </div>
                  </div>
                )}

                <Link
                  to="/profile"
                  aria-label="Profile"
                  className="grid place-items-center"
                >
                  <button className="text-[#1F6FEB] hover:text-[#3FA9F5] transition-colors">
                    <CircleUserRound className="w-7 h-7" />
                  </button>
                </Link>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAuthInitialView("register");
                  setAuthDialogOpen(true);
                }}
              >
                Sign Up
              </Button>
            )}
          </div>

          <button
            className="md:hidden w-10 h-10 flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 text-sm font-medium border-t border-slate-100 pt-3">
            <Link
              to="/"
              className={`block py-1.5 ${isActive("/") ? "text-[#3FA9F5]" : "text-slate-600"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`block py-1.5 ${isActive("/dashboard") ? "text-[#3FA9F5]" : "text-slate-600"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/patients"
              className={`block py-1.5 ${isActive("/patients") ? "text-[#3FA9F5]" : "text-slate-600"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Patients
            </Link>
            <Link
              to="/chat"
              className={`block py-1.5 ${isActive("/chat") ? "text-[#3FA9F5]" : "text-slate-600"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Chat
            </Link>
            <Link
              to="/calendar"
              className={`block py-1.5 ${isActive("/calendar") ? "text-[#3FA9F5]" : "text-slate-600"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Calendar
            </Link>
            <Link
              to="/ai-tool"
              className={`block py-1.5 ${isActive("/ai-tool") ? "text-[#3FA9F5]" : "text-slate-600"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Try AI Scan
            </Link>
            <Link
              to="/profile"
              className={`block py-1.5 ${isActive("/profile") ? "text-[#3FA9F5]" : "text-slate-600"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
          </div>
        )}
      </div>

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={(val) => setAuthDialogOpen(val)}
        initialView={authInitialView}
      />
    </nav>
  );
}
