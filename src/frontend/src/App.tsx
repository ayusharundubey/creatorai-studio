import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  Clapperboard,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Mic,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AIImageGenerator from "./pages/AIImageGenerator";
import Dashboard from "./pages/Dashboard";
import MyProjects from "./pages/MyProjects";
import ProblemSolver from "./pages/ProblemSolver";
import ScriptPlanner from "./pages/ScriptPlanner";
import VideoPromptStudio from "./pages/VideoPromptStudio";
import VoiceAudioTools from "./pages/VoiceAudioTools";

type Page =
  | "dashboard"
  | "scripts"
  | "ai-images"
  | "voice"
  | "video-studio"
  | "problems"
  | "projects";

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "scripts", label: "Script Planner", icon: <FileText size={18} /> },
  { id: "ai-images", label: "AI Image Gen", icon: <Sparkles size={18} /> },
  { id: "voice", label: "Voice & Audio", icon: <Mic size={18} /> },
  {
    id: "video-studio",
    label: "Video Studio",
    icon: <Clapperboard size={18} />,
  },
  { id: "problems", label: "Problem Solver", icon: <HelpCircle size={18} /> },
  { id: "projects", label: "My Projects", icon: <FolderKanban size={18} /> },
];

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { identity, login, clear } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const principalText = identity?.getPrincipal().toString() ?? "";
  const shortId = principalText ? `${principalText.slice(0, 5)}...` : "";

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard onNavigate={(p) => setPage(p as Page)} />;
      case "scripts":
        return <ScriptPlanner />;
      case "ai-images":
        return <AIImageGenerator />;
      case "voice":
        return <VoiceAudioTools />;
      case "video-studio":
        return <VideoPromptStudio />;
      case "problems":
        return <ProblemSolver />;
      case "projects":
        return <MyProjects />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          role="button"
          tabIndex={0}
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setSidebarOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap size={16} className="text-primary" />
          </div>
          <span className="font-display font-bold text-sidebar-foreground text-base">
            CreatorAI
          </span>
          <button
            type="button"
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => {
                setPage(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                page === item.id
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Auth footer */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {shortId.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {shortId}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="text-xs px-2"
              >
                Out
              </Button>
            </div>
          ) : (
            <Button onClick={login} className="w-full" size="sm">
              Connect Wallet
            </Button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button type="button" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-foreground" />
          </button>
          <span className="font-display font-bold text-sm">
            CreatorAI Studio
          </span>
          {!isLoggedIn && (
            <Button size="sm" onClick={login} className="ml-auto text-xs">
              Login
            </Button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
      </div>

      <Toaster richColors />
    </div>
  );
}
