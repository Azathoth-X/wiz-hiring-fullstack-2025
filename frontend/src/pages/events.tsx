import { useState, useEffect } from "react"
import { EventCard } from "@/components/event-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search,  Plus } from "lucide-react"

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

// Mock API function
const fetchEvents = (): Promise<Event[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockEvents: Event[] = [
        {
          id: "1",
          title: "React Workshop: Building Modern UIs",
          description: "Learn the latest React patterns and best practices in this hands-on workshop. We'll cover hooks, context, and performance optimization.",
          isPrivate: false,
          createdAt: new Date("2025-06-25T14:00:00Z"),
          creator: {
            name: "John Doe",
            username: "johndoe"
          },
          totalSlots: 20,
          availableSlots: 5
        },
        {
          id: "2",
          title: "Team Standup Meeting",
          description: "Weekly team sync to discuss progress and blockers",
          isPrivate: true,
          createdAt: new Date("2025-06-24T09:00:00Z"),
          creator: {
            name: "Sarah Smith",
            username: "sarahsmith"
          },
          totalSlots: 10,
          availableSlots: 0
        },
        {
          id: "3",
          title: "Docker Fundamentals",
          description: "Introduction to containerization with Docker. Perfect for beginners!",
          isPrivate: false,
          createdAt: new Date("2025-06-26T16:30:00Z"),
          creator: {
            name: "Mike Johnson",
            username: "mikej"
          },
          totalSlots: 15,
          availableSlots: 12
        },
        {
          id: "4",
          title: "Product Strategy Discussion",
          description: "Quarterly planning session for the product roadmap",
          isPrivate: true,
          createdAt: new Date("2025-06-27T13:00:00Z"),
          creator: {
            name: "Emily Davis",
            username: "emilyd"
          },
          totalSlots: 8,
          availableSlots: 2
        },
        {
          id: "5",
          title: "JavaScript Deep Dive",
          description: "Advanced JavaScript concepts: closures, prototypes, and async programming",
          isPrivate: false,
          createdAt: new Date("2025-06-28T10:00:00Z"),
          creator: {
            name: "Alex Chen",
            username: "alexc"
          },
          totalSlots: 25,
          availableSlots: 18
        },
        {
          id: "6",
          title: "Design System Review",
          description: null,
          isPrivate: true,
          createdAt: new Date("2025-06-29T15:00:00Z"),
          creator: {
            name: "Lisa Wang",
            username: "lisaw"
          },
          totalSlots: 6,
          availableSlots: 1
        }
      ]
      resolve(mockEvents)
    }, 800) // Simulate network delay
  })
}

export default function EventsPage() {
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
    console.log("View details for event:", eventId)
    // Navigate to event details page
  }

  const handleBookEvent = (eventId: string) => {
    console.log("Book event:", eventId)
    // Handle booking logic
  }

  const handleCreateEvent = () => {
    console.log("Create new event")
    // Navigate to create event page
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
          </div>
          <Button onClick={handleCreateEvent} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Join Private Event
          </Button>
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
