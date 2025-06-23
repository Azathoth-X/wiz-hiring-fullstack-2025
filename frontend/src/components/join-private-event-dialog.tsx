import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"

interface JoinPrivateEventDialogProps {
  children: React.ReactNode
}

export function JoinPrivateEventDialog({ children }: JoinPrivateEventDialogProps) {
  const [eventId, setEventId] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleJoin = () => {
    if (eventId.trim()) {
      setIsOpen(false)
      navigate(`/events/${eventId.trim()}`)
      setEventId("") // Reset the input
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJoin()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Join Private Event
          </DialogTitle>
          <DialogDescription>
            Enter the event ID to join a private event. You can get this ID from the event organizer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eventId">Event ID</Label>
            <Input
              id="eventId"
              placeholder="Enter event ID..."
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              disabled={!eventId.trim()}
            >
              Join Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
