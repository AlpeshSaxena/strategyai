import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-24 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold">StrategyAI</span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          AI-powered website strategy insights. Analyze any site in seconds.
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>
      </div>
    </footer>
  );
}
