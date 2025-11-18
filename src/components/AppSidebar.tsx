import { LayoutDashboard, Package, FileText, Truck, Users, Settings, Building2, PackagePlus, ClipboardList, ShoppingCart } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "대시보드", url: "/", icon: LayoutDashboard },
  { title: "매입/매출처 관리", url: "/vendors", icon: Building2 },
  { title: "상품 등록", url: "/product-registration", icon: PackagePlus },
  { title: "상품 관리", url: "/products", icon: Package },
  { title: "재고 관리", url: "/inventory", icon: ClipboardList },
  { title: "매입 관리", url: "/purchase", icon: ShoppingCart },
  { title: "출고 관리", url: "/outbound", icon: Truck },
  { title: "청구 관리", url: "/billing", icon: FileText },
  { title: "배송 관리", url: "/shipping", icon: Truck },
  { title: "사용자 관리", url: "/users", icon: Users },
  { title: "설정", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">로지봇</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                      activeClassName="bg-accent text-primary font-medium"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <NavLink 
          to="/profile"
          className="flex items-center gap-3 hover:bg-accent p-2 rounded-lg transition-colors"
          activeClassName="bg-accent"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            관
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">관리자</p>
            <p className="text-xs text-muted-foreground truncate">admin@logibot.com</p>
          </div>
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
