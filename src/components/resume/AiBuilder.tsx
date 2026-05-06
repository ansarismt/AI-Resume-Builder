import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ResumeData } from "./types";

interface Props {
  onBuilt: (fields: Omit<ResumeData, "template">) => void;
}

const EXAMPLE =
  "I'm Ada Lovelace, ada@analytical.engine. Results-driven Senior Engineer with 3+ years architecting scalable systems using TypeScript, React, and PostgreSQL. Currently at Acme designing system infrastructure. BSc Computer Science, University of Cambridge (2019). Professional Summary: Proven expertise in full-stack development and system architecture. Technical Skills: TypeScript, React, Python, PostgreSQL, REST APIs, Cloud Architecture. Experience: Senior Engineer at Acme (2021-present) - Architected microservices infrastructure serving 100K+ daily users, reduced response time by 40%, mentored junior engineers. Internships: Product Intern at Stripe (2020) - Shipped 3 API endpoints for 500+ merchants; Research Intern at MIT Labs (2019) - Conducted ML research, published findings. Projects: AI Dashboard for Sales Forecasting using React and Python - improved forecast accuracy by 35%, implemented interactive visualizations. Certifications: AWS Solutions Architect Professional (2023), Scrum Master Certification (2022).";

export function AiBuilder({ onBuilt }: Props) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    const text = prompt.trim();
    if (text.length < 15) {
      toast.error("Add a few more details first");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("build-resume", {
        body: { prompt: text },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.resume) throw new Error("No resume returned");
      onBuilt(data.resume);
      toast.success("Resume drafted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to build");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={`Describe yourself clearly. Include: Experience (jobs), Internships (intern roles), Skills, Education, Projects (built/created), Achievements (awards/recognition), Certifications.\n\ne.g. "${EXAMPLE}"`}
        className="resize-none"
      />
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setPrompt(EXAMPLE)}
          className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
        >
          Try example
        </button>
        <Button
          onClick={run}
          disabled={loading}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
          {loading ? "Building…" : "Build with AI"}
        </Button>
      </div>
    </div>
  );
}