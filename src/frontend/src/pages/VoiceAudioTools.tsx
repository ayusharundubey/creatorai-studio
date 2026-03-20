import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Copy, Loader2, Mic, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PromptType } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const templates: Record<string, string> = {
  intro:
    "Hey everyone, welcome back to [Channel Name]! I'm [Your Name], and today we're going to [topic]. If you're new here, make sure to hit subscribe so you don't miss any future videos.",
  tutorial:
    "In this video, I'm going to show you exactly how to [skill/task]. By the end, you'll be able to [outcome]. Let's start with step one: [first step].",
  explainer:
    "Have you ever wondered [question]? Today we're breaking down [topic] in the simplest way possible. Here's what you need to know: [key point 1], [key point 2], and [key point 3].",
  story:
    "Let me tell you a story. It was [time/setting], and I was [situation]. Everything changed when [turning point]. Here's what happened and what I learned from it.",
  ad: "This video is sponsored by [Brand]. [Brand] is [one-line description]. Right now, [Brand] is offering [special deal] exclusively for my viewers. Check the link in the description.",
};

const checklistItems = [
  "Remove background noise (AI denoiser)",
  "Normalize audio levels to -14 LUFS",
  "Add light reverb for warmth",
  "Cut long pauses and filler words",
  "Add background music (10-15% volume)",
  "Export as AAC 192kbps stereo",
  "Sync audio with video waveform",
  "Add captions/subtitles for accessibility",
];

export default function VoiceAudioTools() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const qc = useQueryClient();
  const [template, setTemplate] = useState("intro");
  const [voiceScript, setVoiceScript] = useState(templates.intro);
  const [tone, setTone] = useState("");
  const [speed, setSpeed] = useState("");
  const [emotion, setEmotion] = useState("");
  const [promptTitle, setPromptTitle] = useState("");
  const [checked, setChecked] = useState<string[]>([]);
  const [builtVoicePrompt, setBuiltVoicePrompt] = useState("");

  const { data: prompts = [] } = useQuery({
    queryKey: ["prompts"],
    queryFn: () => actor!.getAllSavedPrompts(),
    enabled: !!actor && !!identity,
  });
  const voicePrompts = prompts.filter((p) => p.promptType === PromptType.voice);

  const saveMutation = useMutation({
    mutationFn: (text: string) =>
      actor!.savePrompt(
        crypto.randomUUID(),
        PromptType.voice,
        promptTitle || "Voice Prompt",
        text,
        [],
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt saved");
    },
    onError: () => toast.error("Failed to save"),
  });

  const buildVoicePrompt = () => {
    const parts = [
      tone && `Tone: ${tone}`,
      speed && `Speed: ${speed}`,
      emotion && `Emotion: ${emotion}`,
      "Clear enunciation, professional delivery",
    ].filter(Boolean);
    const result = `${parts.join(". ")}. ${voiceScript}`;
    setBuiltVoicePrompt(result);
  };

  const toggleCheck = (item: string) => {
    setChecked((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Voice & Audio Tools</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Voiceover scripts, TTS prompts, and audio cleanup
        </p>
      </div>

      <Tabs defaultValue="templates">
        <TabsList className="mb-6">
          <TabsTrigger value="templates">Script Templates</TabsTrigger>
          <TabsTrigger value="tts">TTS Prompt Helper</TabsTrigger>
          <TabsTrigger value="checklist">Audio Checklist</TabsTrigger>
          {identity && (
            <TabsTrigger value="saved">
              Saved ({voicePrompts.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic size={18} className="text-primary" />
                Voiceover Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Template Type</Label>
                <Select
                  value={template}
                  onValueChange={(v) => {
                    setTemplate(v);
                    setVoiceScript(templates[v]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intro">Channel Intro</SelectItem>
                    <SelectItem value="tutorial">Tutorial / How-To</SelectItem>
                    <SelectItem value="explainer">Explainer</SelectItem>
                    <SelectItem value="story">Story Format</SelectItem>
                    <SelectItem value="ad">Sponsored Ad Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Script (Edit the placeholders)</Label>
                <Textarea
                  value={voiceScript}
                  onChange={(e) => setVoiceScript(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(voiceScript);
                    toast.success("Copied");
                  }}
                  className="flex-1"
                >
                  <Copy size={14} className="mr-2" />
                  Copy Script
                </Button>
                {identity && (
                  <Button
                    onClick={() => saveMutation.mutate(voiceScript)}
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin mr-2" />
                    ) : (
                      <Save size={14} className="mr-2" />
                    )}
                    Save
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tts" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>TTS Prompt Composer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Professional",
                        "Casual",
                        "Authoritative",
                        "Friendly",
                        "Conversational",
                      ].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Speed</Label>
                  <Select value={speed} onValueChange={setSpeed}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Slow", "Normal", "Fast", "Dynamic"].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Emotion</Label>
                <Select value={emotion} onValueChange={setEmotion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Enthusiastic",
                      "Calm",
                      "Serious",
                      "Warm",
                      "Urgent",
                      "Inspirational",
                    ].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Script Text</Label>
                <Textarea
                  value={voiceScript}
                  onChange={(e) => setVoiceScript(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={buildVoicePrompt} className="w-full">
                Build TTS Prompt
              </Button>
              {builtVoicePrompt && (
                <div className="space-y-2">
                  <Textarea
                    value={builtVoicePrompt}
                    readOnly
                    rows={4}
                    className="bg-muted/30 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(builtVoicePrompt);
                        toast.success("Copied");
                      }}
                      className="flex-1"
                    >
                      <Copy size={14} className="mr-2" />
                      Copy
                    </Button>
                    {identity && (
                      <>
                        <Input
                          placeholder="Title"
                          value={promptTitle}
                          onChange={(e) => setPromptTitle(e.target.value)}
                          className="h-9 text-xs"
                        />
                        <Button
                          size="sm"
                          onClick={() => saveMutation.mutate(builtVoicePrompt)}
                          disabled={saveMutation.isPending}
                        >
                          <Save size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare size={18} className="text-emerald-400" />
                Audio Cleanup Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklistItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <Checkbox
                    checked={checked.includes(item)}
                    onCheckedChange={() => toggleCheck(item)}
                  />
                  <span
                    className={`text-sm ${checked.includes(item) ? "line-through text-muted-foreground" : ""}`}
                  >
                    {item}
                  </span>
                </div>
              ))}
              <div className="pt-2 text-sm text-muted-foreground">
                {checked.length}/{checklistItems.length} completed
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {identity && (
          <TabsContent value="saved">
            <div className="space-y-3">
              {voicePrompts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No saved voice prompts yet.
                </p>
              ) : (
                voicePrompts.map((p) => (
                  <Card key={p.id} className="glass-card">
                    <CardContent className="p-4">
                      <p className="font-medium text-sm mb-1">{p.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {p.promptText}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
