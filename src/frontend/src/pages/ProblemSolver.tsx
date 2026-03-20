import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Loader2,
  Send,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Category, Status } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const faqs = [
  {
    q: "My video is lagging / choppy in the timeline",
    a: "This is usually a proxy issue. Create proxy files (lower resolution copies) for editing. In Premiere: Right-click clips > Proxy > Create Proxies. In DaVinci: Playback > Proxy Mode > Half/Quarter resolution.",
  },
  {
    q: "Audio is out of sync with video",
    a: "This usually happens with variable frame rate (VFR) footage from phones. Convert footage to constant frame rate (CFR) using HandBrake before importing. Set CFR at 30fps and re-import.",
  },
  {
    q: "Export is taking too long",
    a: "Enable GPU acceleration in your settings (Preferences > Media > GPU Acceleration). Use H.264 hardware encoding instead of software. Reduce preview quality during export.",
  },
  {
    q: "My footage looks grainy and dark",
    a: "Increase ISO compensation in color correction, apply noise reduction (Neat Video or DaVinci's built-in NR), and brighten exposure with a curve lift. For future shoots, use faster lenses or more lighting.",
  },
  {
    q: "Colors look washed out on YouTube",
    a: "YouTube compresses videos heavily. Export at a higher bitrate (35+ Mbps for 1080p). Slightly oversaturate your colors by 10-15% to compensate for compression.",
  },
  {
    q: "Background hum / noise in my audio",
    a: "Use a noise reduction plugin: Audacity's built-in NR, iZotope RX, or DaVinci's noise reduction. Record a 2-second room tone sample and use it as the noise profile.",
  },
  {
    q: "My video was rejected by the platform",
    a: "Check aspect ratio (16:9 for YouTube, 9:16 for TikTok/Reels), file size limits, duration limits, and codec requirements. Most platforms require H.264 in an MP4 container.",
  },
];

const categoryLabels: Record<string, string> = {
  audio: "Audio",
  other: "Other",
  video: "Video",
  lighting: "Lighting",
  export_: "Export",
};

export default function ProblemSolver() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const qc = useQueryClient();
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => actor!.getAllProblemReports(),
    enabled: !!actor && !!identity,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      actor!.submitProblemReport(
        crypto.randomUUID(),
        category as Category,
        description,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      setDescription("");
      setCategory("");
      toast.success("Problem submitted");
    },
    onError: () => toast.error("Failed to submit"),
  });

  const handleSubmit = () => {
    if (!identity) {
      toast.error("Please log in first");
      return;
    }
    if (!category || !description) {
      toast.error("Fill in all fields");
      return;
    }
    submitMutation.mutate();
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Problem Solver</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Submit issues and browse common troubleshooting guides
        </p>
      </div>

      <Tabs defaultValue="faq">
        <TabsList className="mb-6">
          <TabsTrigger value="faq">
            <HelpCircle size={14} className="mr-1" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="submit">
            <Send size={14} className="mr-1" />
            Submit Issue
          </TabsTrigger>
          {identity && (
            <TabsTrigger value="my">My Reports ({reports.length})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="faq">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle size={18} className="text-primary" />
                Common Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-1">
                {faqs.map((faq) => (
                  <AccordionItem
                    key={faq.q}
                    value={faq.q}
                    className="border border-border rounded-lg px-3 mb-2"
                  >
                    <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-3">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submit">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Submit a Problem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!identity && (
                <div className="p-4 rounded-lg bg-muted/30 text-muted-foreground text-sm">
                  Please connect your wallet to submit issues.
                </div>
              )}
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="export_">Export</SelectItem>
                    <SelectItem value="lighting">Lighting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Describe your problem</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what's happening, what you've tried, and your setup..."
                  rows={5}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending || !identity}
              >
                {submitMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Problem
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {identity && (
          <TabsContent value="my">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : reports.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">
                No reports submitted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <Card key={r.id} className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline">
                          {categoryLabels[r.category] ?? r.category}
                        </Badge>
                        <Badge
                          className={
                            r.status === Status.resolved
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }
                        >
                          {r.status === Status.resolved ? (
                            <CheckCircle size={12} className="mr-1" />
                          ) : (
                            <AlertCircle size={12} className="mr-1" />
                          )}
                          {r.status === Status.resolved ? "Resolved" : "Open"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {r.description}
                      </p>
                      {r.resolutionNote && (
                        <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <p className="text-xs text-emerald-400 font-medium mb-1">
                            Resolution
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {r.resolutionNote}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
