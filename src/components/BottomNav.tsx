import { Link, useLocation } from "react-router-dom";
import { Home, Image, Users } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/home", icon: Home, label: "홈", emoji: "🏠" },
    { path: "/album", icon: Image, label: "앨범", emoji: "📷" },
    { path: "/showcase", icon: Users, label: "자랑", emoji: "💫" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border/30 safe-area-pb z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ path, label, emoji }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-6 py-2 transition-all duration-200 ${
                isActive 
                  ? "text-foreground scale-105" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-lg">{emoji}</span>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
