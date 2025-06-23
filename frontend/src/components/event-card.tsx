import { Clock, Users, Lock, Globe, Calendar } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDateInTimezone } from "@/utils/timezone"

interface EventCardProps {
  event: {
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
  onViewDetails?: (eventId: string) => void
  onBook?: (eventId: string) => void
}

export function EventCard({ event, onViewDetails, onBook }: EventCardProps) {
  const isFullyBooked = event.availableSlots === 0
  const occupancyPercentage = ((event.totalSlots - event.availableSlots) / event.totalSlots) * 100


  return (
    <Card className="w-full max-w-md transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {event.title}
            </CardTitle>
            {event.description && (
              <CardDescription className="mt-2 line-clamp-2">
                {event.description}
              </CardDescription>
            )}
          </div>
          <div className="ml-2">
            {event.isPrivate ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Creator Info */}
        {event.creator && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {event.creator.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span>by {event.creator.name}</span>
          </div>
        )}        {/* Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Created {formatDateInTimezone(event.createdAt, { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}</span>
        </div>

        {/* Slots Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {event.availableSlots} of {event.totalSlots} slots available
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                isFullyBooked 
                  ? 'bg-destructive' 
                  : occupancyPercentage > 80 
                    ? 'bg-orange-500' 
                    : 'bg-primary'
              }`}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isFullyBooked 
              ? 'bg-destructive/10 text-destructive' 
              : event.availableSlots <= 3
                ? 'bg-orange-500/10 text-orange-600'
                : 'bg-green-500/10 text-green-600'
          }`}>
            <Clock className="h-3 w-3" />
            {isFullyBooked ? 'Fully Booked' : event.availableSlots <= 3 ? 'Almost Full' : 'Available'}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onViewDetails?.(event.id)}
        >
          View Details
        </Button>
        <Button 
          size="sm" 
          className="flex-1"
          disabled={isFullyBooked}
          onClick={() => onBook?.(event.id)}
        >
          {isFullyBooked ? 'Fully Booked' : 'Book Now'}
        </Button>
      </CardFooter>
    </Card>
  )
}
