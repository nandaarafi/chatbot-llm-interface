'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '../ui/sidebar'

interface ChatSession {
  id: string
  title: string
}

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json() as Promise<ChatSession[]>
})

export function ChatHistory({ open }: { open: boolean }) {
  const router = useRouter()
  const { data: sessions, error, isLoading } = useSWR<ChatSession[]>('/api/chat-sessions', fetcher)

  // While loading
  if (isLoading) {
    return (
      <div className="overflow-y-auto flex-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              Loading history...
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    )
  }

  // On error
  if (error) {
    return (
      <div className="overflow-y-auto flex-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              Failed to load
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto flex-1">
      <SidebarMenu>
        {sessions && sessions.length > 0 ? (
          sessions.map(({ id, title }) => (
            <SidebarMenuItem key={id}>
              <SidebarMenuButton onClick={() => router.push(`/chat/${id}`)}>
                <span className="truncate">
                  {open ? title : `C${id}`}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        ) : (
          <div className="px-4 py-2 text-sm text-muted-foreground text-center">
            {open ? 'No chat history yet' : 'No chats'}
          </div>
        )}
      </SidebarMenu>
    </div>
  )
}
