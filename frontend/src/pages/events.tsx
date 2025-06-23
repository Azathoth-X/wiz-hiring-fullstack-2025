import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { EventCard } from "@/components/event-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import { JoinPrivateEventDialog } from "@/components/join-private-event-dialog"
import { apiClient, API_CONFIG } from "@/config/api"

interface Event {
  id: string
  title: string
  description: string | null
  isPrivate: boolean
  createdAt: Date
  creator: {
    name: string
    username: string
  } | null
  totalSlots: number
  availableSlots: number
}

// API function to fetch events
const fetchEvents = async (): Promise<Event[]> => {
  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.EVENTS.LIST)
    return response.events.map((event: Event & { createdAt: string }) => ({
      ...event,
      createdAt: new Date(event.createdAt),
      creator: event.creator || null
    }))
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return []
  }
}

export default function EventsPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        const eventData = await fetchEvents()
        setEvents(eventData)
      } catch (error) {
        console.error("Failed to fetch events:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.creator?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch 
  })
  const handleViewDetails = (eventId: string) => {
    navigate(`/events/${eventId}`)
  }

  const handleBookEvent = (eventId: string) => {
    navigate(`/events/${eventId}`)
  }
  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 gap-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">
              Discover and book slots for upcoming events
            </p>
          </div>          <JoinPrivateEventDialog>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Join Private Event
            </Button>
          </JoinPrivateEventDialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No events found
            </h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={handleViewDetails}
                onBook={handleBookEvent}
              />
            ))}
          </div>
        )}

        {/* Results count */}
        <div className="text-sm text-muted-foreground text-center pt-4">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      </div>
    </div>
  )
}
