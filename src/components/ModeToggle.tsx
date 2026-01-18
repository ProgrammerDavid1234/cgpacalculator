import { Button } from "@/components/ui/button"
import { useCGPA } from '@/context/CGPAContext';
import { Moon, Sun } from 'lucide-react';

export function ModeToggle() {
  const { state, toggleDarkMode } = useCGPA();
  const { darkMode } = state;

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleDarkMode} 
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      className="hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-950/30 dark:hover:text-green-400 dark:hover:border-green-800"
    >
      {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}