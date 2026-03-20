import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Script } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const emptyForm = { title: "", hook: "", body: "", callToAction: "", tags: "" };

export default function ScriptPlanner() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Script | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: scripts = [], isLoading } = useQuery({
    queryKey: ["scripts"],
    queryFn: () => actor!.getAllScripts(),
    enabled: !!actor && !!identity,
  });

  const createMutation = useMutation({
    mutationFn: (f: typeof emptyForm) =>
      actor!.createScript(
        crypto.randomUUID(),
        f.title,
        f.hook,
        f.body,
        f.callToAction,
        f.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scripts"] });
      setOpen(false);
      toast.success("Script saved");
    },
    onError: () => toast.error("Failed to save script"),
  });

  const updateMutation = useMutation({
    mutationFn: (f: typeof emptyForm) =>
      actor!.updateScript(
        editing!.id,
        f.title,
        f.hook,
        f.body,
        f.callToAction,
        f.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scripts"] });
      setOpen(false);
      toast.success("Script updated");
    },
    onError: () => toast.error("Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteScript(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scripts"] });
      toast.success("Script deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (s: Script) => {
    setEditing(s);
    setForm({
      title: s.title,
      hook: s.hook,
      body: s.body,
      callToAction: s.callToAction,
      tags: s.tags.join(", "),
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!identity) {
      toast.error("Please log in first");
      return;
    }
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    if (editing) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Script Planner</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Write and manage your video scripts
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} className="mr-2" />
          New Script
        </Button>
      </div>

      {!identity && (
        <div className="glass-card rounded-xl p-6 text-center text-muted-foreground mb-6">
          Connect your wallet to save and view scripts.
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : scripts.length === 0 && identity ? (
        <div className="glass-card rounded-xl p-10 text-center">
          <FileText size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No scripts yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scripts.map((s) => (
            <Card key={s.id} className="glass-card">
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base font-semibold">
                    {s.title}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(s)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => deleteMutation.mutate(s.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">Hook:</span>{" "}
                  {s.hook}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  <span className="text-foreground font-medium">Body:</span>{" "}
                  {s.body}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">CTA:</span>{" "}
                  {s.callToAction}
                </p>
                {s.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {s.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Script" : "New Script"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Video title"
              />
            </div>
            <div>
              <Label>Hook</Label>
              <Textarea
                value={form.hook}
                onChange={(e) =>
                  setForm((p) => ({ ...p, hook: e.target.value }))
                }
                placeholder="Attention-grabbing opening..."
                rows={2}
              />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea
                value={form.body}
                onChange={(e) =>
                  setForm((p) => ({ ...p, body: e.target.value }))
                }
                placeholder="Main content..."
                rows={4}
              />
            </div>
            <div>
              <Label>Call to Action</Label>
              <Input
                value={form.callToAction}
                onChange={(e) =>
                  setForm((p) => ({ ...p, callToAction: e.target.value }))
                }
                placeholder="Subscribe, comment, share..."
              />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={form.tags}
                onChange={(e) =>
                  setForm((p) => ({ ...p, tags: e.target.value }))
                }
                placeholder="youtube, tutorial, tech"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
