import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTimezoneStore } from "@/stores/timezone-store"

const commonTimezones = [
  { label: "UTC", value: "UTC" },
  { label: "EST (New York)", value: "America/New_York" },
  { label: "PST (Los Angeles)", value: "America/Los_Angeles" },
  { label: "GMT (London)", value: "Europe/London" },
  { label: "CET (Paris)", value: "Europe/Paris" },
  { label: "JST (Tokyo)", value: "Asia/Tokyo" },
  { label: "IST (Mumbai)", value: "Asia/Kolkata" },
  { label: "AEST (Sydney)", value: "Australia/Sydney" },
]

export function TimezoneToggle() {
  const { timezone, setTimezone } = useTimezoneStore()

  const currentTimezone = commonTimezones.find(tz => tz.value === timezone) || 
    { label: timezone.split('/').pop() || timezone, value: timezone }

  return (
    <DropdownMenu >
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" title={`Current timezone: ${currentTimezone.label}`}>
          <Clock className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change timezone</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {commonTimezones.map((tz) => (
          <DropdownMenuItem 
            key={tz.value} 
            onClick={() => setTimezone(tz.value)}
            className={timezone === tz.value ? "bg-accent" : ""}
          >
            {tz.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
