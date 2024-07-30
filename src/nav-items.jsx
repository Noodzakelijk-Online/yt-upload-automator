import { Home, Youtube, RefreshCw } from "lucide-react";
import Index from "./pages/Index.jsx";
import YouTubeAutomation from "./pages/YouTubeAutomation.jsx";
import RetroactiveUpdate from "./components/RetroactiveUpdate.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "YouTube Automation",
    to: "/youtube-automation",
    icon: <Youtube className="h-4 w-4" />,
    page: <YouTubeAutomation />,
  },
  {
    title: "Retroactive Updates",
    to: "/retroactive-updates",
    icon: <RefreshCw className="h-4 w-4" />,
    page: <RetroactiveUpdate />,
  },
];
