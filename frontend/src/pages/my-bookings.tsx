import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Mail, ExternalLink, AlertCircle } from 'lucide-react'
import { apiClient, API_CONFIG } from '@/config/api'
import { formatDateRangeInTimezone, formatDateInTimezone } from '@/utils/timezone'
import { useUserStore } from '@/stores/user-store'
import NotAuth from '@/components/not-auth'
import { useTimezoneStore } from '@/stores/timezone-store'

interface Booking {
  id: string
  guestName: string
  guestEmail: string
  status: 'SCHEDULED' | 'CANCELLED'
  bookedAt: Date
  slot: {
    id: string
    startTime: Date
    endTime: Date
  } | null
  event: {
    id: string
    title: string
    description: string
  } | null
}

export default function MyBookingsPage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { timezone } = useTimezoneStore()

  useCallback(()=>{},[timezone])

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.get(API_CONFIG.ENDPOINTS.BOOKINGS.LIST)
        
        // Convert date strings to Date objects
        const bookingsData = response.bookings.map((booking: Booking & { 
          bookedAt: string
          slot: { startTime: string; endTime: string } | null 
        }) => ({
          ...booking,
          bookedAt: new Date(booking.bookedAt),
          slot: booking.slot ? {
            ...booking.slot,
            startTime: new Date(booking.slot.startTime),
            endTime: new Date(booking.slot.endTime)
          } : null
        }))

        setBookings(bookingsData)
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
        setError(err instanceof Error ? err.message : 'Failed to load bookings')
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if user is authenticated
    if (user?.id) {
      fetchBookings()
    } else {
      setLoading(false)
    }
  }, [user])

  const handleViewEvent = (eventId: string) => {
    navigate(`/events/${eventId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-green-500/10 text-green-600'
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-600'
      default:
        return 'bg-gray-500/10 text-gray-600'
    }
  }

  const isUpcoming = (startTime: Date) => {
    return new Date(startTime) > new Date()
  }

  const isPast = (endTime: Date) => {
    return new Date(endTime) < new Date()
  }
  if (!user?.id) {
    return (
      <NotAuth/>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">Loading your bookings...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-destructive">Error Loading Bookings</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            {bookings.length === 0 
              ? 'No bookings found.' 
              : `You have ${bookings.length} booking${bookings.length !== 1 ? 's' : ''}.`
            }
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't booked any events yet. Browse available events to get started.
              </p>
              <Button onClick={() => navigate('/events')}>
                Browse Events
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {booking.event?.title || 'Unknown Event'}
                      </CardTitle>
                      {booking.event?.description && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {booking.event.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.toLowerCase()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Time Slot Info */}
                  {booking.slot && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatDateRangeInTimezone(booking.slot.startTime, booking.slot.endTime)}
                        </span>
                      </div>
                      
                      {/* Time Status */}
                      <div className="flex items-center gap-2">
                        {isPast(booking.slot.endTime) ? (
                          <Badge variant="secondary" className="text-xs">
                            Completed
                          </Badge>
                        ) : isUpcoming(booking.slot.startTime) ? (
                          <Badge variant="default" className="text-xs bg-blue-500/10 text-blue-600">
                            Upcoming
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-xs bg-orange-500/10 text-orange-600">
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Guest Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.guestName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{booking.guestEmail}</span>
                    </div>
                  </div>

                  {/* Booking Date */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Booked {formatDateInTimezone(booking.bookedAt, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  {booking.event && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewEvent(booking.event!.id)}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Event
                    </Button>
                  )}
                  
                  {booking.status === 'SCHEDULED' && booking.slot && isUpcoming(booking.slot.startTime) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement cancel booking functionality
                        console.log('Cancel booking:', booking.id)
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
