import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Clapperboard, Copy, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const CAMERA_MOVEMENTS = [
  "Static",
  "Slow Pan Left",
  "Slow Pan Right",
  "Zoom In",
  "Zoom Out",
  "Aerial/Drone",
  "Handheld",
  "Tracking Shot",
];

const LIGHTINGS = [
  "Golden Hour",
  "Cinematic",
  "Neon",
  "Natural",
  "Studio",
  "Night/Dark",
];

const MOODS = [
  "Cinematic",
  "Documentary",
  "Dreamy",
  "Action",
  "Horror",
  "Comedy",
  "Romantic",
];

const DURATIONS = ["5 seconds", "10 seconds", "15 seconds", "30 seconds"];

function buildPrompt(fields: {
  subject: string;
  camera: string;
  lighting: string;
  mood: string;
  duration: string;
  extra: string;
}): string {
  const parts: string[] = [];

  if (fields.subject.trim()) {
    parts.push(fields.subject.trim());
  }

  const technical: string[] = [];
  if (fields.camera) technical.push(`${fields.camera} camera movement`);
  if (fields.lighting) technical.push(`${fields.lighting} lighting`);
  if (fields.mood) technical.push(`${fields.mood} mood/style`);
  if (fields.duration) technical.push(`Duration: ${fields.duration}`);

  if (technical.length > 0) {
    parts.push(technical.join(", "));
  }

  if (fields.extra.trim()) {
    parts.push(fields.extra.trim());
  }

  return parts.join(". ");
}

export default function VideoPromptStudio() {
  const [subject, setSubject] = useState("");
  const [camera, setCamera] = useState("");
  const [lighting, setLighting] = useState("");
  const [mood, setMood] = useState("");
  const [duration, setDuration] = useState("");
  const [extra, setExtra] = useState("");

  const assembled = buildPrompt({
    subject,
    camera,
    lighting,
    mood,
    duration,
    extra,
  });

  const handleCopy = async () => {
    if (!assembled.trim()) {
      toast.error("Nothing to copy yet. Fill in the form first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(assembled);
      toast.success("Prompt copied to clipboard!");
    } catch {
      toast.error("Failed to copy. Please select and copy manually.");
    }
  };

  return (
    <div className="min-h-full p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
            <Clapperboard size={20} className="text-accent" />
          </div>
          <h1 className="font-display text-2xl font-bold gradient-text">
            Video Prompt Studio
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Build optimized video prompts for Veo 3 and Runway. Fill in the
          details below, then copy your prompt.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Subject */}
          <div className="glass-card rounded-xl p-5 space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              Subject / Scene
            </Label>
            <Textarea
              data-ocid="video_studio.textarea"
              placeholder="A chef carefully plating a gourmet dish in a modern restaurant kitchen..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="min-h-[100px] resize-none bg-background/50 border-border/50 focus:border-primary/50 text-sm"
            />
          </div>

          {/* Camera + Lighting */}
          <div className="glass-card rounded-xl p-5 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Camera Movement
              </Label>
              <Select value={camera} onValueChange={setCamera}>
                <SelectTrigger
                  data-ocid="video_studio.select"
                  className="bg-background/50 border-border/50 text-sm"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {CAMERA_MOVEMENTS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Lighting
              </Label>
              <Select value={lighting} onValueChange={setLighting}>
                <SelectTrigger
                  data-ocid="video_studio.select"
                  className="bg-background/50 border-border/50 text-sm"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {LIGHTINGS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mood + Duration */}
          <div className="glass-card rounded-xl p-5 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Mood / Style
              </Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger
                  data-ocid="video_studio.select"
                  className="bg-background/50 border-border/50 text-sm"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {MOODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Duration
              </Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger
                  data-ocid="video_studio.select"
                  className="bg-background/50 border-border/50 text-sm"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Extra details */}
          <div className="glass-card rounded-xl p-5 space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              Extra Details (optional)
            </Label>
            <Textarea
              data-ocid="video_studio.textarea"
              placeholder="Close-up on hands, soft background music, rain falling outside..."
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              className="min-h-[80px] resize-none bg-background/50 border-border/50 focus:border-primary/50 text-sm"
            />
          </div>
        </motion.div>

        {/* Preview + Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Live prompt preview */}
          <div className="glass-card rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-foreground">
                Live Prompt Preview
              </Label>
              <span className="text-xs text-muted-foreground">
                {assembled.length} chars
              </span>
            </div>
            <div
              data-ocid="video_studio.panel"
              className="min-h-[180px] p-4 rounded-lg bg-background/60 border border-border/40 text-sm text-foreground/90 whitespace-pre-wrap font-mono leading-relaxed"
            >
              {assembled.trim() ? (
                assembled
              ) : (
                <span className="text-muted-foreground/50 italic">
                  Your assembled prompt will appear here as you fill in the
                  form...
                </span>
              )}
            </div>
          </div>

          {/* Copy button */}
          <Button
            data-ocid="video_studio.primary_button"
            onClick={handleCopy}
            className="w-full gap-2 h-11"
            size="lg"
          >
            <Copy size={16} />
            Copy Prompt
          </Button>

          {/* Note */}
          <div className="glass-card rounded-xl p-4">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              📋 Paste this prompt into Veo 3 or Runway to generate your video.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="space-y-3">
            <a
              href="https://aitestkitchen.withgoogle.com/tools/video-fx"
              target="_blank"
              rel="noreferrer"
              data-ocid="video_studio.link"
            >
              <Button
                variant="outline"
                className="w-full gap-2 h-11 border-primary/30 hover:border-primary/60"
              >
                <ExternalLink size={16} />
                Open Google VideoFX (Veo 3)
              </Button>
            </a>
            <a
              href="https://runwayml.com"
              target="_blank"
              rel="noreferrer"
              data-ocid="video_studio.link"
            >
              <Button
                variant="outline"
                className="w-full gap-2 h-11 border-accent/30 hover:border-accent/60"
              >
                <ExternalLink size={16} />
                Open Runway
              </Button>
            </a>
          </div>

          {/* Tips */}
          <div className="glass-card rounded-xl p-5 space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              💡 Pro Tips
            </Label>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                • Be specific about subjects — names, colors, textures help
              </li>
              <li>• Veo 3 responds well to cinematic language</li>
              <li>• Runway excels at stylized and artistic prompts</li>
              <li>• Add "ultra-high definition" for photorealistic results</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-muted-foreground/50 pb-4">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-muted-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
