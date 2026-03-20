import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, Film, Keyboard, Monitor, Palette } from "lucide-react";
import { useState } from "react";

const workflowSteps = [
  {
    title: "Import & Organize",
    color: "text-blue-400",
    tips: [
      "Create bins/folders by type (A-roll, B-roll, audio, graphics)",
      "Rename clips descriptively",
      "Check footage quality and frame rate",
    ],
    checks: ["Import all footage", "Organize into bins", "Check sync points"],
  },
  {
    title: "Rough Cut",
    color: "text-violet-400",
    tips: [
      "Focus on pacing and story first",
      "Don't worry about fine details yet",
      "Leave handles on cuts for flexibility",
    ],
    checks: [
      "Tell the story in order",
      "Cut to music rhythm",
      "Remove obvious unusable takes",
    ],
  },
  {
    title: "Color Grade",
    color: "text-orange-400",
    tips: [
      "Correct exposure and white balance first",
      "Apply LUT as starting point",
      "Use scopes -- don't trust your monitor blindly",
    ],
    checks: [
      "Primary color correction done",
      "Secondary grades applied",
      "Consistency across clips checked",
    ],
  },
  {
    title: "Audio Mix",
    color: "text-emerald-400",
    tips: [
      "Dialogue should sit at -12 to -6 dB",
      "Music at -20 to -15 dB under dialogue",
      "Add room tone to fill silences",
    ],
    checks: [
      "Voice normalized",
      "Background music balanced",
      "SFX added and mixed",
    ],
  },
  {
    title: "Motion & Graphics",
    color: "text-pink-400",
    tips: [
      "Keep text on screen at least 3 seconds",
      "Use consistent font and color system",
      "Animate with ease-in/out curves",
    ],
    checks: ["Lower thirds added", "Title card created", "End screen set up"],
  },
  {
    title: "Export",
    color: "text-yellow-400",
    tips: [
      "Export at highest quality first, then compress",
      "H.264 for web, ProRes for archive",
      "Check file size before uploading",
    ],
    checks: [
      "Review exported file",
      "Check audio sync on export",
      "Verify aspect ratio is correct",
    ],
  },
];

const exportSettings = [
  {
    platform: "YouTube",
    resolution: "3840×2160 / 1920×1080",
    fps: "24/30/60",
    codec: "H.264",
    bitrate: "35–68 Mbps",
    audio: "AAC 320kbps",
  },
  {
    platform: "TikTok",
    resolution: "1080×1920",
    fps: "24–60",
    codec: "H.264",
    bitrate: "6–30 Mbps",
    audio: "AAC 192kbps",
  },
  {
    platform: "Instagram Reels",
    resolution: "1080×1920",
    fps: "30",
    codec: "H.264",
    bitrate: "3.5 Mbps",
    audio: "AAC 128kbps",
  },
  {
    platform: "Twitter/X",
    resolution: "1280×720",
    fps: "40",
    codec: "H.264",
    bitrate: "5 Mbps max",
    audio: "AAC 128kbps",
  },
];

const shortcuts: Record<
  string,
  { action: string; premiere: string; davinci: string; capcut: string }[]
> = {
  cuts: [
    {
      action: "Razor / Cut",
      premiere: "C",
      davinci: "Ctrl+B",
      capcut: "Ctrl+B",
    },
    { action: "Undo", premiere: "Ctrl+Z", davinci: "Ctrl+Z", capcut: "Ctrl+Z" },
    {
      action: "Ripple Delete",
      premiere: "Shift+Del",
      davinci: "Backspace",
      capcut: "Del",
    },
  ],
  playback: [
    {
      action: "Play/Pause",
      premiere: "Space",
      davinci: "Space",
      capcut: "Space",
    },
    { action: "Step Forward", premiere: "→", davinci: "→", capcut: "→" },
    { action: "Step Back", premiere: "←", davinci: "←", capcut: "←" },
  ],
};

export default function VideoEditingTools() {
  const [stepChecks, setStepChecks] = useState<Record<number, string[]>>({});

  const toggleCheck = (stepIdx: number, item: string) => {
    setStepChecks((prev) => {
      const current = prev[stepIdx] || [];
      return {
        ...prev,
        [stepIdx]: current.includes(item)
          ? current.filter((i) => i !== item)
          : [...current, item],
      };
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Video Editing Tools</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Workflows, export guides, and shortcuts for video editors
        </p>
      </div>

      <Tabs defaultValue="workflow">
        <TabsList className="mb-6">
          <TabsTrigger value="workflow">
            <Film size={14} className="mr-1" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="export">
            <Monitor size={14} className="mr-1" />
            Export Guide
          </TabsTrigger>
          <TabsTrigger value="shortcuts">
            <Keyboard size={14} className="mr-1" />
            Shortcuts
          </TabsTrigger>
          <TabsTrigger value="color">
            <Palette size={14} className="mr-1" />
            Color Tips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowSteps.map((step, idx) => (
              <Card key={step.title} className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs w-6 h-6 p-0 flex items-center justify-center"
                    >
                      {idx + 1}
                    </Badge>
                    <CardTitle className={`text-sm ${step.color}`}>
                      {step.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Tips
                    </p>
                    {step.tips.map((t) => (
                      <p key={t} className="text-xs text-muted-foreground">
                        • {t}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Checklist
                    </p>
                    {step.checks.map((c) => (
                      <div key={c} className="flex items-center gap-2 py-1">
                        <Checkbox
                          checked={(stepChecks[idx] || []).includes(c)}
                          onCheckedChange={() => toggleCheck(idx, c)}
                          className="h-3 w-3"
                        />
                        <span
                          className={`text-xs ${(stepChecks[idx] || []).includes(c) ? "line-through text-muted-foreground" : ""}`}
                        >
                          {c}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="export">
          <Card className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {[
                      "Platform",
                      "Resolution",
                      "FPS",
                      "Codec",
                      "Bitrate",
                      "Audio",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exportSettings.map((row, i) => (
                    <tr
                      key={row.platform}
                      className={`border-b border-border ${i % 2 === 0 ? "" : "bg-muted/10"} hover:bg-muted/20 transition-colors`}
                    >
                      <td className="px-4 py-3 font-medium text-primary">
                        {row.platform}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.resolution}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.fps}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.codec}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.bitrate}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.audio}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="shortcuts">
          <div className="space-y-4">
            {Object.entries(shortcuts).map(([category, rows]) => (
              <Card key={category} className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm capitalize">
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-xs text-muted-foreground uppercase tracking-wide">
                          Action
                        </th>
                        <th className="text-left py-2 text-xs text-muted-foreground uppercase tracking-wide">
                          Premiere Pro
                        </th>
                        <th className="text-left py-2 text-xs text-muted-foreground uppercase tracking-wide">
                          DaVinci
                        </th>
                        <th className="text-left py-2 text-xs text-muted-foreground uppercase tracking-wide">
                          CapCut
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr
                          key={r.action}
                          className="border-b border-border/50"
                        >
                          <td className="py-2 text-foreground">{r.action}</td>
                          <td className="py-2">
                            <Badge
                              variant="outline"
                              className="text-xs font-mono"
                            >
                              {r.premiere}
                            </Badge>
                          </td>
                          <td className="py-2">
                            <Badge
                              variant="outline"
                              className="text-xs font-mono"
                            >
                              {r.davinci}
                            </Badge>
                          </td>
                          <td className="py-2">
                            <Badge
                              variant="outline"
                              className="text-xs font-mono"
                            >
                              {r.capcut}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="color">
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: "Use Scopes, Not Your Eyes",
                tip: "Monitor waveform scopes to ensure proper exposure. Your monitor's brightness can deceive you.",
                color: "border-l-blue-500",
              },
              {
                title: "LUTs as a Starting Point",
                tip: "Apply a LUT first to establish a look, then refine with curves and HSL. Don't rely on LUTs alone.",
                color: "border-l-violet-500",
              },
              {
                title: "Match Before Grade",
                tip: "Color match all clips in a scene before applying creative grades. Inconsistency kills immersion.",
                color: "border-l-orange-500",
              },
              {
                title: "Skin Tones on the Vector",
                tip: "Skin tones should fall on the skin tone line of the vectorscope regardless of ethnicity.",
                color: "border-l-pink-500",
              },
              {
                title: "Contrast = Depth",
                tip: "Lift your blacks slightly for a cinematic look. Crush blacks feel overly harsh in most content.",
                color: "border-l-emerald-500",
              },
              {
                title: "Selective Color",
                tip: "Use Hue vs Saturation curves to desaturate specific colors without affecting others.",
                color: "border-l-yellow-500",
              },
            ].map((card) => (
              <Card
                key={card.title}
                className={`glass-card border-l-4 ${card.color}`}
              >
                <CardContent className="p-4">
                  <p className="font-semibold text-sm mb-2">{card.title}</p>
                  <p className="text-sm text-muted-foreground">{card.tip}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
