"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from 'nextjs-toploader/app';
import { Button } from "@/components/ui/button"
import { 
  Sidebar, 
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar"
import Link from "next/link";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { PanelLeftClose, PanelLeftOpen, MessageSquareText, Settings,   CreditCard, 
  LogOut,  
  Star, 
  Bell,  
  FileText} from "lucide-react"
import { ChatHistory } from "./chat/chat-history";

const NAVIGATION_ITEMS = [
  { id: 'chat', label: 'Chat', icon: MessageSquareText },
  { id: 'documents', label: 'Documents', icon: FileText },
];

const CHAT_HISTORY_ITEMS = [
  { id: '1', title: 'Effective Strategies' },
  { id: '2', title: 'Simple AI Agent PDF' },
];





export function AppSidebar({ user }: { user: any }) {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar();

  const router = useRouter(); // Get the current router
  const { pathname } = router; // Extract the current path name

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
  };

  return (
    <Sidebar className="h-full">
      <SidebarHeader className="flex items-center justify-between p-4">
        {open && <span className="font-semibold">Mindscribe</span>}
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

      <SidebarContent className="flex flex-col h-full">
        {/* Navigation Group */}
        <SidebarGroup className="mb-4">
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {NAVIGATION_ITEMS.map(({ id, label, icon: Icon }) => (
              <SidebarMenuItem key={id}>
                <Link href={id === 'home' ? '/chat' : `/${id}`} className="w-full">
                  <SidebarMenuButton
                    isActive={pathname === `/${id}`} // Check if the current route matches
                    className={pathname === `/${id}` ? 'bg-gray-200 hover:bg-gray-300' : ''}
                  >
                    <Icon className="h-4 w-4" />
                    {open && <span>{label}</span>}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Chat History Group */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <SidebarGroup className="border-t pt-4">
            <SidebarGroupLabel>Chat History</SidebarGroupLabel>
            <ChatHistory open={open} />
          </SidebarGroup>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  {!user.image ? (
                    <div className="h-9 w-9 rounded-md bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden">
                      <span className="text-xs font-medium text-white">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <Avatar>
                      <AvatarImage
                        src={user.image}
                        alt={user.name || 'User avatar'}
                      />
                      <AvatarFallback>
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {open && (
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  )}
                </div>
                {open && <Settings className="h-4 w-4 opacity-50" />}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" side="top">
            <div className="flex items-center gap-3 p-2">
              {!user.image ? (
                <div className="h-9 w-9 rounded-md bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-medium text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <Avatar>
                  <AvatarImage
                    src={user.image}
                    alt={user.name || 'User avatar'}
                  />
                  <AvatarFallback>
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Star className="mr-2 h-4 w-4" />
                <span>Upgrade to Pro</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-400 hover:!bg-red-400/20 hover:!text-red-400 focus:!bg-red-400/20 focus:!text-red-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
