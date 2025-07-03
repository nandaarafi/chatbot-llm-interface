"use client"

import { Button } from "@/components/ui/button"
import { 
  Sidebar, 
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar"
import { PanelLeftClose, PanelLeftOpen, Home, FileText, Settings } from "lucide-react"

export function AppSidebar() {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar()

  return (
    <Sidebar className="h-full">
      <SidebarHeader className="flex items-center justify-between p-4">
        {open && <span className="font-semibold">Your Logo</span>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          {open ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive>
              <Home className="h-4 w-4" />
              {open && <span>Home</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <FileText className="h-4 w-4" />
              {open && <span>Documents</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        {open && (
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">v1.0.0</span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}