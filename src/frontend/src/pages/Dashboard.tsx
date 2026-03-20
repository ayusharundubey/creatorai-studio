import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Film,
  FolderKanban,
  HelpCircle,
  ImageIcon,
  Mic,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";

type Page =
  | "dashboard"
  | "scripts"
  | "images"
  | "voice"
  | "video"
  | "problems"
  | "projects";

interface Props {
  onNavigate: (page: Page) => void;
}

const tools = [
  {
    id: "scripts" as Page,
    title: "Script Planner",
    desc: "Write and save structured video scripts with hooks, body, and CTAs.",
    icon: <FileText size={24} />,
    gradient: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-400",
  },
  {
    id: "images" as Page,
    title: "Image Prompt Builder",
    desc: "Compose detailed AI image prompts for any style, mood, and subject.",
    icon: <ImageIcon size={24} />,
    gradient: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-400",
  },
  {
    id: "voice" as Page,
    title: "Voice & Audio",
    desc: "Build voiceover scripts and audio prompt templates for your content.",
    icon: <Mic size={24} />,
    gradient: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-400",
  },
  {
    id: "video" as Page,
    title: "Video Editing",
    desc: "Step-by-step editing workflows, export guides, and keyboard shortcuts.",
    icon: <Film size={24} />,
    gradient: "from-orange-500/20 to-amber-500/10",
    iconColor: "text-orange-400",
  },
  {
    id: "problems" as Page,
    title: "Problem Solver",
    desc: "Submit issues and browse common content creator troubleshooting fixes.",
    icon: <HelpCircle size={24} />,
    gradient: "from-rose-500/20 to-pink-500/10",
    iconColor: "text-rose-400",
  },
  {
    id: "projects" as Page,
    title: "My Projects",
    desc: "Track your video projects from planning through to published.",
    icon: <FolderKanban size={24} />,
    gradient: "from-yellow-500/20 to-lime-500/10",
    iconColor: "text-yellow-400",
  },
];

export default function Dashboard({ onNavigate }: Props) {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap size={16} className="text-primary" />
          </div>
          <span className="text-sm text-primary font-medium">
            AI-Powered Studio
          </span>
        </div>
        <h1 className="font-display text-4xl lg:text-5xl font-bold gradient-text mb-3">
          CreatorAI Studio
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Everything a content creator needs -- from scripting and prompts to
          editing workflows and problem solving.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Tools Available", value: "6", icon: <Star size={16} /> },
          { label: "Templates", value: "20+", icon: <TrendingUp size={16} /> },
          { label: "Platform Guides", value: "4", icon: <Film size={16} /> },
        ].map((stat) => (
          <Card key={stat.label} className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-primary">{stat.icon}</span>
              <div>
                <p className="text-xl font-bold font-display">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tool cards */}
      <h2 className="font-display text-lg font-semibold mb-4 text-foreground">
        Your Tools
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <button
            type="button"
            key={tool.id}
            onClick={() => onNavigate(tool.id)}
            className={`text-left p-5 rounded-xl bg-gradient-to-br ${tool.gradient} border border-border hover:border-primary/40 transition-all hover:scale-[1.02] hover:glow-purple glass-card group`}
          >
            <div
              className={`mb-3 ${tool.iconColor} group-hover:scale-110 transition-transform inline-block`}
            >
              {tool.icon}
            </div>
            <h3 className="font-display font-semibold text-foreground mb-1">
              {tool.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tool.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
