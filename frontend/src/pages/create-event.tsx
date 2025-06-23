
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CalendarIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { apiClient, API_CONFIG } from '@/config/api'
import { useUserStore } from '@/stores/user-store'
import NotAuth from '@/components/not-auth'

interface EventSlot {
  id: string
  date: Date | undefined
  startTime: string
  endTime: string
  maxBookings: number
}

export default function CreateEvent() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [createdEventId, setCreatedEventId] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [slots, setSlots] = useState<EventSlot[]>([
    {
      id: '1',
      date: undefined,
      startTime: '10:00',
      endTime: '11:00',
      maxBookings: 10
    }
  ])

  const addSlot = () => {
    const newSlot: EventSlot = {
      id: Date.now().toString(),
      date: undefined,
      startTime: '10:00',
      endTime: '11:00',
      maxBookings: 10
    }
    setSlots([...slots, newSlot])
  }

  const removeSlot = (id: string) => {
    if (slots.length > 1) {
      setSlots(slots.filter(slot => slot.id !== id))
    }
  }
  const updateSlot = (id: string, field: keyof EventSlot, value: string | number | Date | undefined) => {
    setSlots(slots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim() || title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters long'
    }
    if (title.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters'
    }

    if (!description.trim() || description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters long'
    }
    if (description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters'
    }

    // Validate slots
    slots.forEach((slot, index) => {
      if (!slot.date) {
        newErrors[`slot-${slot.id}-date`] = `Date is required for slot ${index + 1}`
      }
      if (!slot.startTime) {
        newErrors[`slot-${slot.id}-startTime`] = `Start time is required for slot ${index + 1}`
      }
      if (!slot.endTime) {
        newErrors[`slot-${slot.id}-endTime`] = `End time is required for slot ${index + 1}`
      }
      if (slot.startTime && slot.endTime && slot.startTime >= slot.endTime) {
        newErrors[`slot-${slot.id}-time`] = `End time must be after start time for slot ${index + 1}`
      }
      if (slot.maxBookings < 1 || slot.maxBookings > 50) {
        newErrors[`slot-${slot.id}-maxBookings`] = `Max bookings must be between 1 and 50 for slot ${index + 1}`
      }
      if (slot.date && new Date(`${slot.date.toISOString().split('T')[0]}T${slot.startTime}:00`) <= new Date()) {
        newErrors[`slot-${slot.id}-future`] = `Slot ${index + 1} must be scheduled for a future date and time`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const formattedSlots = slots.map(slot => {
        const dateStr = slot.date!.toISOString().split('T')[0]
        return {
          startTime: `${dateStr}T${slot.startTime}:00.000Z`,
          endTime: `${dateStr}T${slot.endTime}:00.000Z`,
          maxBookings: slot.maxBookings
        }
      })

      const eventData = {
        title: title.trim(),
        description: description.trim(),
        isPrivate,
        slots: formattedSlots
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.EVENTS.CREATE, eventData)
      
      setCreatedEventId(response.event.id)
      setShowSuccessDialog(true)
    } catch (error) {
      console.error('Failed to create event:', error)
      setErrors({ submit: 'Failed to create event. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessDialog(false)
    navigate('/events')
  }

  const handleViewEvent = () => {
    setShowSuccessDialog(false)
    navigate(`/events/${createdEventId}`)
  }

  if(!user?.id){
    return(
        <NotAuth/>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-muted-foreground">
          Create a new event and set up time slots for people to book.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Event Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>                <Input
                  id="title"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  placeholder="Enter event title"
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>                <Textarea
                  id="description"
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                  placeholder="Describe your event"
                  rows={4}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="private"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
                <Label htmlFor="private">Make this event private</Label>
              </div>
              {isPrivate && (
                <p className="text-sm text-muted-foreground">
                  Private events won't appear in the public list and require an event ID to join.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Time Slots */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Time Slots</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSlot}
                disabled={slots.length >= 20}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Slot
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {slots.map((slot, index) => (
                <div key={slot.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Slot {index + 1}</h4>
                    {slots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSlot(slot.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Date Picker */}
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !slot.date ? 'text-muted-foreground' : ''
                          } ${errors[`slot-${slot.id}-date`] ? 'border-destructive' : ''}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {slot.date ? slot.date.toLocaleDateString() : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={slot.date}
                          onSelect={(date) => updateSlot(slot.id, 'date', date)}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors[`slot-${slot.id}-date`] && (
                      <p className="text-sm text-destructive">{errors[`slot-${slot.id}-date`]}</p>
                    )}
                    {errors[`slot-${slot.id}-future`] && (
                      <p className="text-sm text-destructive">{errors[`slot-${slot.id}-future`]}</p>
                    )}
                  </div>

                  {/* Time Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSlot(slot.id, 'startTime', e.target.value)}
                        className={errors[`slot-${slot.id}-startTime`] || errors[`slot-${slot.id}-time`] ? 'border-destructive' : ''}
                      />
                      {errors[`slot-${slot.id}-startTime`] && (
                        <p className="text-sm text-destructive">{errors[`slot-${slot.id}-startTime`]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSlot(slot.id, 'endTime', e.target.value)}
                        className={errors[`slot-${slot.id}-endTime`] || errors[`slot-${slot.id}-time`] ? 'border-destructive' : ''}
                      />
                      {errors[`slot-${slot.id}-endTime`] && (
                        <p className="text-sm text-destructive">{errors[`slot-${slot.id}-endTime`]}</p>
                      )}
                    </div>
                  </div>
                  {errors[`slot-${slot.id}-time`] && (
                    <p className="text-sm text-destructive">{errors[`slot-${slot.id}-time`]}</p>
                  )}

                  {/* Max Bookings */}
                  <div className="space-y-2">
                    <Label>Maximum Bookings</Label>                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={slot.maxBookings}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSlot(slot.id, 'maxBookings', parseInt(e.target.value) || 1)}
                      className={errors[`slot-${slot.id}-maxBookings`] ? 'border-destructive' : ''}
                    />
                    {errors[`slot-${slot.id}-maxBookings`] && (
                      <p className="text-sm text-destructive">{errors[`slot-${slot.id}-maxBookings`]}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="space-y-4">
            {errors.submit && (
              <p className="text-sm text-destructive">{errors.submit}</p>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating Event...' : 'Create Event'}
            </Button>
          </div>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Created Successfully!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Your event has been created and is now available for bookings.</p>
            <div className="flex space-x-2">
              <Button onClick={handleViewEvent} className="flex-1">
                View Event
              </Button>
              <Button variant="outline" onClick={handleSuccessClose} className="flex-1">
                Back to Events
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}