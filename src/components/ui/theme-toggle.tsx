import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDark =
      localStorage.getItem("workora-theme") === "dark" ||
      (!("workora-theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  }, []);

  const toggle = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("workora-theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("workora-theme", "light");
      setTheme("light");
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="h-9 w-9 rounded-lg"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <Moon className="h-4.5 w-4.5 transition-transform hover:scale-110" />
          ) : (
            <Sun className="h-4.5 w-4.5 transition-transform hover:scale-110" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {theme === "light" ? "Enable Dark Mode" : "Enable Light Mode"}
      </TooltipContent>
    </Tooltip>
  );
}
