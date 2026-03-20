import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ImageIcon, Loader2, Save, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PromptType } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const styles = [
  "Photorealistic",
  "Cinematic",
  "Anime",
  "Oil Painting",
  "Watercolor",
  "3D Render",
  "Cartoon",
  "Sketch",
  "Neon Art",
  "Vintage",
];
const lightings = [
  "Golden Hour",
  "Studio Lighting",
  "Neon Lights",
  "Soft Diffused",
  "Dramatic Shadow",
  "Blue Hour",
  "Harsh Backlight",
  "Candlelight",
];
const moods = [
  "Dramatic",
  "Peaceful",
  "Energetic",
  "Mysterious",
  "Romantic",
  "Futuristic",
  "Dark",
  "Vibrant",
  "Minimalist",
  "Epic",
];

export default function ImagePromptBuilder() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");
  const [style, setStyle] = useState("");
  const [lighting, setLighting] = useState("");
  const [mood, setMood] = useState("");
  const [extra, setExtra] = useState("");
  const [saveTitle, setSaveTitle] = useState("");
  const [builtPrompt, setBuiltPrompt] = useState("");

  const { data: prompts = [] } = useQuery({
    queryKey: ["prompts"],
    queryFn: () => actor!.getAllSavedPrompts(),
    enabled: !!actor && !!identity,
  });

  const imagePrompts = prompts.filter((p) => p.promptType === PromptType.image);

  const saveMutation = useMutation({
    mutationFn: () =>
      actor!.savePrompt(
        crypto.randomUUID(),
        PromptType.image,
        saveTitle || "Image Prompt",
        builtPrompt,
        [],
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt saved");
    },
    onError: () => toast.error("Failed to save"),
  });

  const buildPrompt = () => {
    if (!subject) {
      toast.error("Please enter a subject");
      return;
    }
    const parts = [
      subject,
      style && `${style} style`,
      lighting && `${lighting} lighting`,
      mood && `${mood} mood`,
      extra,
      "highly detailed, 8k, professional quality",
    ].filter(Boolean);
    setBuiltPrompt(parts.join(", "));
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(builtPrompt);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">
          Image Prompt Builder
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Compose detailed AI image generation prompts
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Builder */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              Build Your Prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Subject *</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="A futuristic city at night"
              />
            </div>
            <div>
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose style" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lighting</Label>
              <Select value={lighting} onValueChange={setLighting}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose lighting" />
                </SelectTrigger>
                <SelectContent>
                  {lightings.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose mood" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Extra Details</Label>
              <Input
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="rain, reflections, bokeh"
              />
            </div>
            <Button onClick={buildPrompt} className="w-full">
              <Sparkles size={16} className="mr-2" />
              Generate Prompt
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <div className="space-y-4">
          {builtPrompt && (
            <Card className="glass-card border-primary/30">
              <CardHeader>
                <CardTitle className="text-base">Generated Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={builtPrompt}
                  readOnly
                  rows={5}
                  className="text-sm bg-muted/30 resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPrompt}
                    className="flex-1"
                  >
                    <Copy size={14} className="mr-2" />
                    Copy
                  </Button>
                  {identity && (
                    <div className="flex gap-2 flex-1">
                      <Input
                        placeholder="Prompt title"
                        value={saveTitle}
                        onChange={(e) => setSaveTitle(e.target.value)}
                        className="text-xs h-9"
                      />
                      <Button
                        size="sm"
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending}
                      >
                        {saveMutation.isPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {identity && imagePrompts.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ImageIcon size={16} />
                  Saved Image Prompts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {imagePrompts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="w-full text-left p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setBuiltPrompt(p.promptText)}
                  >
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {p.promptText}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
