import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Zap, History, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";

export function Nav() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">StrategyAI</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/demo">
            <Button
              variant={location === "/demo" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5 text-xs"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Demo
            </Button>
          </Link>
          <Link href="/history">
            <Button
              variant={location === "/history" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5 text-xs"
            >
              <History className="w-3.5 h-3.5" />
              History
            </Button>
          </Link>

          {/* Theme toggle pill */}
          <div className="ml-2 flex items-center gap-0.5 rounded-full border border-border bg-muted/50 p-0.5">
            <button
              onClick={() => setTheme("light")}
              title="Light mode"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                !isDark
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              title="Dark mode"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                isDark
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dark</span>
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
