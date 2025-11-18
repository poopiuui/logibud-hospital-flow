import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LayoutDashboard, Package, FileText, Truck, Users, Settings, Building2, PackagePlus, ClipboardList, ShoppingCart, FolderTree, ListChecks, ChevronDown, ChevronRight, Phone, FileDigit, Store } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      { title: "등록양식", url: "/registration-templates", icon: FileText },
    ]
  },
  { title: "상품 등록", url: "/product-registration", icon: PackagePlus },
  { title: "상품 관리", url: "/products", icon: Package },
  { title: "재고 관리", url: "/inventory", icon: ClipboardList },
  { title: "매입 관리", url: "/purchase", icon: ShoppingCart },
  { title: "출고 관리", url: "/outbound", icon: Truck },
  { title: "배송 관리", url: "/shipping", icon: Truck },
  { title: "매출 관리", url: "/sales", icon: FileText },
  { title: "청구 관리", url: "/billing", icon: FileText },
  { title: "B2B 관리", url: "/b2b-management", icon: Store },
  { title: "사용자 관리", url: "/users", icon: Users },
  { title: "설정", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const [companyName, setCompanyName] = useState("로지봇");
  const [companyLogo, setCompanyLogo] = useState("");
  const [companyBusinessNumber, setCompanyBusinessNumber] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyFax, setCompanyFax] = useState("");
  
  // 메뉴 커스터마이징 설정 로드
  const [customizedMenu, setCustomizedMenu] = useState(menuItems);
  
  // 등록관리 섹션의 하위 메뉴 URL 목록
  const registrationUrls = ["/registration-templates", "/category-management", "/purchase-order-management", "/quotation-management"];
  
  // 현재 라우트가 등록관리 하위 메뉴에 있는지 확인
  const isRegistrationActive = registrationUrls.includes(location.pathname);
  
  // 등록관리 섹션이 열려있는지 여부 (현재 활성 라우트가 있으면 자동으로 열림)
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(isRegistrationActive);

  useEffect(() => {
    const savedName = localStorage.getItem('companyName');
    const savedLogo = localStorage.getItem('companyLogo');
    const savedBusinessNumber = localStorage.getItem('companyBusinessNumber');
    const savedPhone = localStorage.getItem('companyPhone');
    const savedFax = localStorage.getItem('companyFax');
    
    if (savedName) setCompanyName(savedName);
    if (savedLogo) setCompanyLogo(savedLogo);
    if (savedBusinessNumber) setCompanyBusinessNumber(savedBusinessNumber);
    if (savedPhone) setCompanyPhone(savedPhone);
    if (savedFax) setCompanyFax(savedFax);
    
    // 메뉴 설정 로드
    const savedMenuSettings = localStorage.getItem('menuSettings');
    if (savedMenuSettings) {
      try {
        const settings = JSON.parse(savedMenuSettings);
        const reorderedMenu = settings.order
          .map((title: string) => menuItems.find(item => item.title === title))
          .filter((item: any) => item && !settings.hidden.includes(item.title));
        setCustomizedMenu(reorderedMenu);
      } catch (e) {
        console.error('Failed to load menu settings:', e);
      }
    }
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarHeader className="border-b p-4 cursor-pointer hover:bg-accent transition-colors">
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
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 ml-4 bg-background border shadow-lg z-[100]">
            <DropdownMenuLabel className="text-base font-semibold">{companyName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {companyBusinessNumber && (
              <DropdownMenuItem className="flex items-center gap-2 py-2">
                <FileDigit className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">사업자번호</p>
                  <p className="text-sm font-medium">{companyBusinessNumber}</p>
                </div>
              </DropdownMenuItem>
            )}
            {companyPhone && (
              <DropdownMenuItem className="flex items-center gap-2 py-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">대표전화</p>
                  <p className="text-sm font-medium">{companyPhone}</p>
                </div>
              </DropdownMenuItem>
            )}
            {companyFax && (
              <DropdownMenuItem className="flex items-center gap-2 py-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">팩스번호</p>
                  <p className="text-sm font-medium">{companyFax}</p>
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {customizedMenu.map((item) => (
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
    </>
  );
}
