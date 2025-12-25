import { Link, useLocation } from "react-router-dom";
import { Home, Image, Users, Heart } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/home", icon: Home, label: "홈" },
    { path: "/album", icon: Image, label: "앨범" },
    { path: "/showcase", icon: Users, label: "자랑" },
    { path: "/memorial", icon: Heart, label: "추모" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t safe-area-pb z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-4 py-2 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
