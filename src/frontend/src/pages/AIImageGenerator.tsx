import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Download,
  ImageIcon,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const STYLES = [
  {
    id: "realistic",
    label: "Realistic",
    suffix: "photorealistic, 8k, detailed",
  },
  {
    id: "anime",
    label: "Anime",
    suffix: "anime style, vibrant, Japanese animation",
  },
  {
    id: "digital-art",
    label: "Digital Art",
    suffix: "digital art, concept art, detailed illustration",
  },
  {
    id: "oil-painting",
    label: "Oil Painting",
    suffix: "oil painting style, textured brushstrokes, classical",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    suffix: "cinematic photography, dramatic lighting, film still",
  },
  {
    id: "watercolor",
    label: "Watercolor",
    suffix: "watercolor painting, soft edges, artistic",
  },
];

type AspectRatio = "square" | "landscape" | "portrait";

const RATIOS: { id: AspectRatio; label: string; dims: [number, number] }[] = [
  { id: "square", label: "Square (1:1)", dims: [512, 512] },
  { id: "landscape", label: "Landscape (16:9)", dims: [912, 512] },
  { id: "portrait", label: "Portrait (9:16)", dims: [512, 912] },
];

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [ratio, setRatio] = useState<AspectRatio>("square");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [showNegative, setShowNegative] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCount, setGeneratedCount] = useState(0);

  const selectedStyle = STYLES.find((s) => s.id === style);
  const selectedRatio = RATIOS.find((r) => r.id === ratio)!;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);

    const fullPrompt = [
      prompt.trim(),
      selectedStyle?.suffix,
      negativePrompt ? `avoid: ${negativePrompt}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    const [w, h] = selectedRatio.dims;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${w}&height=${h}&model=flux&nologo=true&seed=${Date.now()}`;
    setImageUrl(url);
  };

  const handleImageLoad = () => {
    setLoading(false);
    setGeneratedCount((c) => c + 1);
  };

  const handleImageError = () => {
    setLoading(false);
    setError("Failed to generate image. Please try again.");
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
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Sparkles size={20} className="text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold gradient-text">
            AI Image Generator
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Generate stunning images from text descriptions using Flux AI.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-5"
        >
          {/* Prompt */}
          <div className="glass-card rounded-xl p-5 space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              Describe your image
            </Label>
            <Textarea
              data-ocid="ai_image.input"
              placeholder="A lone astronaut standing on a crimson alien world, twin moons rising on the horizon..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none bg-background/50 border-border/50 focus:border-primary/50 text-sm"
            />
          </div>

          {/* Style */}
          <div className="glass-card rounded-xl p-5 space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              Art Style
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {STYLES.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  data-ocid="ai_image.tab"
                  onClick={() => setStyle(s.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                    style === s.id
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "border-border/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="glass-card rounded-xl p-5 space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              Aspect Ratio
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {RATIOS.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  data-ocid="ai_image.toggle"
                  onClick={() => setRatio(r.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                    ratio === r.id
                      ? "bg-accent/20 border-accent/50 text-accent"
                      : "border-border/30 text-muted-foreground hover:border-accent/30 hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Negative Prompt */}
          <div className="glass-card rounded-xl p-5 space-y-3">
            <button
              type="button"
              data-ocid="ai_image.toggle"
              onClick={() => setShowNegative(!showNegative)}
              className="flex items-center justify-between w-full text-sm font-semibold text-foreground"
            >
              Negative Prompt (optional)
              {showNegative ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
            <AnimatePresence>
              {showNegative && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Textarea
                    data-ocid="ai_image.textarea"
                    placeholder="Things to avoid: blurry, low quality, ugly..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="min-h-[80px] resize-none bg-background/50 border-border/50 focus:border-primary/50 text-sm"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            data-ocid="ai_image.primary_button"
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="w-full h-12 text-base font-semibold glow-purple"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles size={18} />
                Generate Image
              </span>
            )}
          </Button>
        </motion.div>

        {/* Output panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-card rounded-xl p-5 h-full min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-semibold text-foreground">
                Generated Image
              </Label>
              {generatedCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {generatedCount} generated
                </span>
              )}
            </div>

            <div
              data-ocid="ai_image.canvas_target"
              className="flex-1 rounded-lg overflow-hidden bg-background/50 border border-border/30 flex items-center justify-center relative"
            >
              {/* Loading state */}
              {loading && !imageUrl && (
                <div
                  data-ocid="ai_image.loading_state"
                  className="absolute inset-0"
                >
                  <Skeleton className="w-full h-full" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs text-muted-foreground">
                      Generating your image... (5-15s)
                    </p>
                  </div>
                </div>
              )}

              {/* Image */}
              {imageUrl && (
                <>
                  {loading && (
                    <div
                      data-ocid="ai_image.loading_state"
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
                    >
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p className="text-xs text-muted-foreground">
                        Generating your image... (5-15s)
                      </p>
                    </div>
                  )}
                  <img
                    src={imageUrl}
                    alt="AI Generated"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    className={`w-full h-full object-contain transition-opacity duration-500 ${
                      loading ? "opacity-0" : "opacity-100"
                    }`}
                  />
                </>
              )}

              {/* Empty state */}
              {!imageUrl && !loading && !error && (
                <div className="flex flex-col items-center gap-3 text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <ImageIcon size={28} className="text-primary/50" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Your generated image will appear here
                  </p>
                  <p className="text-muted-foreground/60 text-xs">
                    Enter a prompt and click Generate
                  </p>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div
                  data-ocid="ai_image.error_state"
                  className="flex flex-col items-center gap-3 text-center p-8"
                >
                  <p className="text-destructive text-sm">{error}</p>
                  <Button variant="outline" size="sm" onClick={handleGenerate}>
                    Try Again
                  </Button>
                </div>
              )}
            </div>

            {/* Download button */}
            <AnimatePresence>
              {imageUrl && !loading && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4"
                >
                  <a
                    href={imageUrl}
                    download="ai-generated-image.jpg"
                    target="_blank"
                    rel="noreferrer"
                    data-ocid="ai_image.secondary_button"
                  >
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Download size={16} />
                      Download Image
                    </Button>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
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
