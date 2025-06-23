import { Calendar, Home, PlusIcon, User2, LogIn, LogOut } from "lucide-react"
import { Link, useNavigate } from "react-router"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { TimezoneToggle } from "@/components/timezone-toggle"
import { useUserStore } from "@/stores/user-store"

// Menu items.
const items = [
  {
    title: "Events",
    url: "/events",
    icon: Home,
  },
  {
    title: "Create Event",
    url: "/create-event",
    icon: PlusIcon,
  },
  {
    title: "My Bookings",
    url: "/bookings",
    icon: Calendar,
  },
  
]

export function AppSidebar() {
  const { user, isAuthenticated, logout } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  return (
    <Sidebar variant="floating">
      <SidebarHeader className="font-bold text-xl  p-4 pb-2">
        <Link to={'/'}>
            BookMySlot
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>      <SidebarFooter>
        <div className="p-2 space-y-2">
          <div className="flex justify-around">
            <ModeToggle />
            <TimezoneToggle />
          </div>
          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
                <User2 className="h-4 w-4" />
                <span className="truncate">
                  {user?.name || user?.username || 'Guest User'}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                asChild
              >
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}