import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const mobileMenuItems = [
  { title: "대시보드", url: "/", icon: LayoutDashboard },
  { title: "상품관리", url: "/products", icon: Package },
  { title: "매입/매출처", url: "/vendors", icon: Users },
  { title: "청구관리", url: "/billing", icon: FileText },
  { title: "설정", url: "/settings", icon: Settings },
];

export function MobileNavigation() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  if (!isMobile) return null;

  return (
    <>
      {/* Bottom Tab Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
        <nav className="flex items-center justify-around h-16 px-2">
          {mobileMenuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.url}
                to={item.url}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.title}</span>
              </NavLink>
            );
          })}
          
          {/* Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground hover:text-foreground"
              >
                <Menu className="w-5 h-5" />
                <span className="text-xs">메뉴</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">전체 메뉴</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="grid grid-cols-2 gap-4">
                {[
                  { title: "대시보드", url: "/", icon: LayoutDashboard },
                  { title: "매입/매출처", url: "/vendors", icon: Users },
                  { title: "상품등록", url: "/product-registration", icon: Package },
                  { title: "상품관리", url: "/products", icon: Package },
                  { title: "재고관리", url: "/inventory", icon: Package },
                  { title: "매입관리", url: "/purchase-management", icon: FileText },
                  { title: "출고관리", url: "/outbound-management", icon: FileText },
                  { title: "청구관리", url: "/billing", icon: FileText },
                  { title: "배송관리", url: "/shipping", icon: FileText },
                  { title: "사용자 관리", url: "/users", icon: Users },
                  { title: "분석", url: "/analytics", icon: LayoutDashboard },
                  { title: "설정", url: "/settings", icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.url}
                      to={item.url}
                      onClick={() => setIsOpen(false)}
                      className="flex flex-col items-center justify-center p-6 rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      <Icon className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>

      {/* Add padding to body to account for bottom nav */}
      <style>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: 4rem;
          }
        }
      `}</style>
    </>
  );
}
