import { Calendar, LogIn } from "lucide-react"
import { Button } from "./ui/button"

export default function NotAuth(){
    return(
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center space-y-4">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold">Authentication Required</h1>
            <p className="text-muted-foreground">
                Please log in to view your bookings.
            </p>
            <Button onClick={() => {
                // TODO: Implement login functionality
                console.log('Login required')
            }}>
                <LogIn className="h-4 w-4 mr-2" />
                Log In
            </Button>
            </div>
        </div>
    )
}