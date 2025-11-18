import { useState, useEffect } from "react";
import { LayoutDashboard, Package, FileText, Truck, Users, Settings, Building2, PackagePlus, ClipboardList, ShoppingCart, FolderTree, ListChecks } from "lucide-react";
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
  { 
    title: "등록관리", 
    icon: FolderTree,
    subItems: [
      { title: "카테고리 등록", url: "/category-management", icon: FolderTree },
      { title: "발주서 관리", url: "/purchase-order-management", icon: ListChecks },
      { title: "견적서 관리", url: "/quotation-management", icon: FileText },
    ]
  },
  { title: "상품 등록", url: "/product-registration", icon: PackagePlus },
  { title: "상품 관리", url: "/products", icon: Package },
  { title: "재고 관리", url: "/inventory", icon: ClipboardList },
  { title: "매입 관리", url: "/purchase", icon: ShoppingCart },
  { title: "출고 관리", url: "/outbound", icon: Truck },
  { title: "매출 관리", url: "/sales", icon: FileText },
  { title: "청구 관리", url: "/billing", icon: FileText },
  { title: "배송 관리", url: "/shipping", icon: Truck },
  { title: "사용자 관리", url: "/users", icon: Users },
  { title: "설정", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [companyName, setCompanyName] = useState("로지봇");
  const [companyLogo, setCompanyLogo] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem('companyName');
    const savedLogo = localStorage.getItem('companyLogo');
    
    if (savedName) setCompanyName(savedName);
    if (savedLogo) setCompanyLogo(savedLogo);
  }, []);

  return (
    <Sidebar className="border-r">
      <SidebarHeader 
        className="border-b p-4 cursor-pointer hover:bg-accent transition-colors"
        onClick={() => window.location.href = '/settings'}
      >
        <div className="flex items-center gap-3">
          {companyLogo ? (
            <img 
              src={companyLogo} 
              alt={companyName} 
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
          )}
          <span className="text-xl font-bold text-sidebar-foreground">{companyName}</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {'subItems' in item ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 px-3 py-2 text-sidebar-foreground font-medium">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </div>
                      <div className="ml-8 space-y-1">
                        {item.subItems.map((subItem) => (
                          <SidebarMenuButton asChild key={subItem.title}>
                            <NavLink 
                              to={subItem.url}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground text-sm"
                              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                            >
                              <subItem.icon className="w-4 h-4" />
                              <span>{subItem.title}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/"}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <NavLink 
          to="/profile"
          className="flex items-center gap-3 hover:bg-sidebar-accent p-2 rounded-lg transition-colors"
          activeClassName="bg-sidebar-accent"
        >
          <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-semibold">
            관
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">관리자</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">admin@logibot.com</p>
          </div>
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
