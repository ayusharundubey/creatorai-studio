import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Edit2, FolderKanban, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Stage } from "../backend";
import type { VideoProject } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const stageConfig: Record<string, { label: string; color: string }> = {
  planning: {
    label: "Planning",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  filming: {
    label: "Filming",
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  editing: {
    label: "Editing",
    color: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  },
  exporting: {
    label: "Exporting",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  published: {
    label: "Published",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
};

const stageOrder: Stage[] = [
  Stage.planning,
  Stage.filming,
  Stage.editing,
  Stage.exporting,
  Stage.published,
];

const emptyForm = { title: "", stage: Stage.planning as Stage, notes: "" };

export default function MyProjects() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VideoProject | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const principal = identity!.getPrincipal();
      return actor!.getUserVideoProjects(principal);
    },
    enabled: !!actor && !!identity,
  });

  const createMutation = useMutation({
    mutationFn: (f: typeof emptyForm) =>
      actor!.createVideoProject(crypto.randomUUID(), f.title, f.stage, f.notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      toast.success("Project created");
    },
    onError: () => toast.error("Failed to create project"),
  });

  const updateMutation = useMutation({
    mutationFn: (f: typeof emptyForm) =>
      actor!.updateVideoProject(editing!.id, f.title, f.stage, f.notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      toast.success("Project updated");
    },
    onError: () => toast.error("Failed to update"),
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (p: VideoProject) => {
    setEditing(p);
    setForm({ title: p.title, stage: p.stage, notes: p.notes });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!identity) {
      toast.error("Please log in");
      return;
    }
    if (!form.title) {
      toast.error("Title required");
      return;
    }
    if (editing) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const projectsByStage = stageOrder.reduce(
    (acc, stage) => {
      acc[stage] = projects.filter((p) => p.stage === stage);
      return acc;
    },
    {} as Record<Stage, VideoProject[]>,
  );

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">My Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your video projects from idea to publish
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} className="mr-2" />
          New Project
        </Button>
      </div>

      {!identity && (
        <div className="glass-card rounded-xl p-6 text-center text-muted-foreground">
          Connect your wallet to track your projects.
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : projects.length === 0 && identity ? (
        <div className="glass-card rounded-xl p-10 text-center">
          <FolderKanban
            size={40}
            className="mx-auto text-muted-foreground mb-3"
          />
          <p className="text-muted-foreground">
            No projects yet. Create your first one!
          </p>
        </div>
      ) : identity ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stageOrder.map((stage) => (
            <div key={stage}>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${stageConfig[stage].color} border`}>
                  {stageConfig[stage].label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {projectsByStage[stage].length}
                </span>
              </div>
              <div className="space-y-3">
                {projectsByStage[stage].map((p) => (
                  <Card
                    key={p.id}
                    className="glass-card cursor-pointer hover:border-primary/40 transition-all"
                    onClick={() => openEdit(p)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-medium leading-tight">
                          {p.title}
                        </p>
                        <Edit2
                          size={12}
                          className="text-muted-foreground flex-shrink-0 mt-0.5"
                        />
                      </div>
                      {p.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {p.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Project" : "New Project"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="My awesome video"
              />
            </div>
            <div>
              <Label>Stage</Label>
              <Select
                value={form.stage}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, stage: v as Stage }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stageOrder.map((s) => (
                    <SelectItem key={s} value={s}>
                      {stageConfig[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Ideas, links, reminders..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
