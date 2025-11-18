import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LayoutDashboard, Package, FileText, Truck, Users, Settings, Building2, PackagePlus, ClipboardList, ShoppingCart, FolderTree, ListChecks, ChevronDown, ChevronRight } from "lucide-react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CompanyInfoDialog } from "@/components/CompanyInfoDialog";

const menuItems = [
  { title: "대시보드", url: "/", icon: LayoutDashboard },
  { title: "매입/매출처 관리", url: "/vendors", icon: Building2 },
  { 
    title: "등록관리", 
    icon: FolderTree,
    subItems: [
      { title: "등록양식", url: "/registration-templates", icon: FileText },
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
  const location = useLocation();
  const [companyName, setCompanyName] = useState("로지봇");
  const [companyLogo, setCompanyLogo] = useState("");
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  
  // 등록관리 섹션의 하위 메뉴 URL 목록
  const registrationUrls = ["/registration-templates", "/category-management", "/purchase-order-management", "/quotation-management"];
  
  // 현재 라우트가 등록관리 하위 메뉴에 있는지 확인
  const isRegistrationActive = registrationUrls.includes(location.pathname);
  
  // 등록관리 섹션이 열려있는지 여부 (현재 활성 라우트가 있으면 자동으로 열림)
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(isRegistrationActive);

  useEffect(() => {
    const savedName = localStorage.getItem('companyName');
    const savedLogo = localStorage.getItem('companyLogo');
    
    if (savedName) setCompanyName(savedName);
    if (savedLogo) setCompanyLogo(savedLogo);
  }, []);
  
  // 활성 라우트가 변경되면 등록관리 섹션을 자동으로 열기
  useEffect(() => {
    if (isRegistrationActive) {
      setIsRegistrationOpen(true);
    }
  }, [isRegistrationActive]);

  return (
    <>
      <Sidebar className="border-r">
        <SidebarHeader 
          className="border-b p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={() => setShowCompanyInfo(true)}
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
                    <Collapsible
                      open={isRegistrationOpen}
                      onOpenChange={setIsRegistrationOpen}
                      className="space-y-1"
                    >
                      <CollapsibleTrigger className="flex items-center gap-3 px-3 py-2 text-sidebar-foreground font-medium hover:bg-sidebar-accent rounded-lg transition-colors w-full">
                        <item.icon className="w-5 h-5" />
                        <span className="flex-1 text-left">{item.title}</span>
                        {isRegistrationOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent>
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
                      </CollapsibleContent>
                    </Collapsible>
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
    
    <CompanyInfoDialog open={showCompanyInfo} onOpenChange={setShowCompanyInfo} />
    </>
  );
}
