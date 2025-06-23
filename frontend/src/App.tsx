
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Lock } from "lucide-react"
import { JoinPrivateEventDialog } from "@/components/join-private-event-dialog"

function App() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to BookMySlot
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and book slots for events, workshops, and meetings. 
            Manage your schedule efficiently with our intuitive platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/events">
            <div className="group p-6 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Browse Events</h3>
              </div>
              <p className="text-muted-foreground">
                Explore upcoming events and book your slots
              </p>
            </div>
          </Link>

          <JoinPrivateEventDialog>
            <div className="group p-6 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Join Private Event</h3>
              </div>
              <p className="text-muted-foreground">
                Join a private event using an event ID
              </p>
            </div>
          </JoinPrivateEventDialog>

          <Link to="/bookings">
            <div className="group p-6 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">My Bookings</h3>
              </div>
              <p className="text-muted-foreground">
                View and manage your booked slots
              </p>
            </div>
          </Link>
        </div>

        <div className="text-center space-y-4 pt-8">
          <h2 className="text-2xl font-semibold">Ready to get started?</h2>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/events">Browse Events</Link>
            </Button>
            <JoinPrivateEventDialog>
              <Button variant="outline" size="lg">
                Join Private Event
              </Button>
            </JoinPrivateEventDialog>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
