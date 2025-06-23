import { Calendar, LogIn } from "lucide-react"
import { Button } from "./ui/button"
import { Link } from "react-router"

export default function NotAuth(){
    return(
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center space-y-4">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold">Authentication Required</h1>
            <p className="text-muted-foreground">
                Please log in to access this page.
            </p>
            <div className="flex gap-4 justify-center">
                <Button asChild>
                    <Link to="/login">
                        <LogIn className="h-4 w-4 mr-2" />
                        Log In
                    </Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link to="/signup">Sign Up</Link>
                </Button>
            </div>
            </div>
        </div>
    )
}