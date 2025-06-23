
# Live links:
### Frontend: [bookmyslot](bookmyslot.pages.dev) | https://bookmyslot.pages.dev
### Backend: [backend](bookmyslot.tankkmaster25.workers.dev) | https://bookmyslot.tankkmaster25.workers.dev
# BookMySlot – Fullstack Hiring Challenge Submission

This project is a submission for the WizCommerce Fullstack Hiring Challenge, implementing a simple scheduling application similar to Calendly.


## 🔄 Project Overview

The goal was to build a fullstack application where authenticated users can create events with time slots, and visitors can view public events and book available slots. Users can also view their own bookings. Timezone support is implemented to display slots in the user's local time.

## 🚀 Core Features Implemented

Based on the assignment requirements, the following core features have been implemented:

1.  **Create Event (Authenticated User)**:
    *   Input for event title, description.
    *   Ability to add multiple time slots with date, start time, end time, and max bookings.
    *   Option to make the event private.
    *   Validation for input fields and time slots (future dates/times, valid time ranges, max bookings).
    *   Integration with the backend API to create the event.

2.  **Public Event Listing**:
    *   Displays a list of all public events fetched from the backend API.
    *   Shows basic event information (title, creator).
    *   Includes a search bar to filter events by title or creator username.
    *   Provides a way to join private events using an event ID.

3.  **Booking Interface**:
    *   On the Event Details page, available slots are displayed.
    *   Visitors can book a slot by providing their name and email.
    *   Integration with the backend API to submit the booking.
    *   Handles cases where a slot is full or already booked.

4.  **Time Zone Support**:
    *   A timezone selector is available in the sidebar for users to manually override their detected timezone.
    *   Time slots are stored in the backend in UTC (ISO 8601 format) and converted client-side.

5.  **View My Bookings**:
    *   An authenticated user can view a list of all their bookings.
    *   Bookings are fetched from the backend API based on the authenticated user.
    *   Booking details, including event information and slot times (in local timezone), are displayed.
    *   Booking status (Scheduled/Cancelled) is shown.

## 🖥 Frontend Screens

The frontend application includes the following screens:

1.  **Home Page**: A landing page with a brief description and links to browse events and join private events.
2.  **Event Listing Page (`/events`)**: Displays the list of public events with search and private join functionality.
3.  **Event Details Page (`/events/:id`)**: Shows detailed information for a specific event, including description, creator, and available time slots with a booking form.
4.  **Create Event Page (`/create-event`)**: A form for authenticated users to create new events and define time slots. This page is protected and requires authentication.
5.  **My Bookings Page (`/bookings`)**: Displays a list of bookings for the authenticated user. This page is protected and requires authentication.
6.  **Login Page (`/login`)**: Allows existing users to sign in using email and password. Redirects to `/events` if already authenticated.
7.  **Signup Page (`/signup`)**: Allows new users to create an account with name, username, email, and password. Redirects to `/events` if already authenticated.
8.  **Not Authenticated Component**: A component displayed on protected routes when the user is not logged in, prompting them to log in or sign up.

## 📊 API Specification

The backend implements the following API endpoints:

| Method | Endpoint                 | Description                                  | Status     |
| :----- | :----------------------- | :------------------------------------------- | :--------- |
| POST   | `/users/signup`          | Create a new user account                    | Implemented |
| POST   | `/users/signin`          | Authenticate a user and return JWT           | Implemented |
| POST   | `/events`                | Create a new event (requires authentication) | Implemented |
| GET    | `/events`                | List all public events                       | Implemented |
| GET    | `/events/details/:id`    | Get details for a specific event + slots     | Implemented |
| POST   | `/events/:id/bookings`   | Book a slot for a specific event             | Implemented |
| GET    | `/events/bookings`       | View bookings for the authenticated user     | Implemented |

## 📚 Tech Stack

*   **Frontend**:
    *   React (with Vite)
    *   TypeScript
    *   TailwindCSS (for styling)
    *   Zustand (for state management - user and timezone stores)
    *   React Router (for navigation)
    *   `jwt-decode` (for decoding JWT on the frontend)
    *   Shadcn UI (for UI components)
*   **Backend**:
    *   Hono (web framework)
    *   TypeScript
    *   Drizzle ORM (for database interaction)
    *   Zod (for request validation)
    *   Cloudflare Workers 
*   **Database**:
    *   Drizzle ORM is used with migrations (`backend/drizzle.config.ts`, `backend/src/db/schema.ts`, `backend/src/db/migrations`). The specific database backend is configured via Cloudflare Workers bindings (e.g., D1 or a connected PostgreSQL/other DB).

## ⚙️ Local Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd wiz-hiring-fullstack-2025
    ```

2.  **Install dependencies:**
    *   Navigate to the root directory and install pnpm: `npm install -g pnpm`
    *   Install dependencies for both frontend and backend:
        ```bash
        pnpm install
        ```

3.  **Backend Setup (Cloudflare Workers):**
    *   Install `wrangler` CLI: `npm install -g wrangler`
    *   Authenticate with Cloudflare: `wrangler login`
    *   Set up a D1 database or configure bindings for your chosen database in `backend/wrangler.jsonc`.
    *   Apply database migrations using Drizzle and Wrangler:
        ```bash
        cd backend
        pnpm drizzle-kit migrate # This might require specific wrangler/drizzle setup
        # Alternatively, you might need to run wrangler d1 migrations apply <database-name> --local
        ```
4.  **Frontend Setup:**
    *   Create a `.env` file in the `frontend` directory specifying your backend API URL:
        ```env
        VITE_API_BASE_URL=http://127.0.0.1:8787/v1 # Or your deployed backend URL
        ```

5.  **Run the development servers:**
    *   Start the backend (using Wrangler):
        ```bash
        cd backend
        pnpm run dev
        ```
    *   Start the frontend (using Vite):
        ```bash
        cd frontend
        pnpm run dev
        ```

6.  Open your browser to the frontend development server address (usually `http://localhost:5173`).

## 🚗 Deployment Instructions

Follow the instructions in the original `assingment.md` for deploying the frontend and backend to platforms like Vercel, Render, Railway, Cloudflare Pages, etc. Ensure your environment variables (like `JWT_SECRET` for the backend and `VITE_API_BASE_URL` for the frontend) are configured correctly on your hosting platforms.

## 📄 Submission Checklist

Based on the implemented features and the assignment requirements:

*   [x] Working backend with all relevant routes and validations
*   [x] Functional frontend with event listing, detail view, and booking
*   [x] Clear GitHub repository with meaningful commit the repo
*   [x] Frontend deployment URL (e.g., Vercel, Netlify) 
*   [x] Backend deployment URL (e.g., Render, Railway) 
*   [x] Local setup instructions (with `.env.example` - instructions provided above)
*   [x] Well-written README explaining tech choices, folder structure
*   [ ] Bonus features (if implemented) clearly listed in README  
*   [x] Short write-up on assumptions made and areas for improvement (See section below)

## 🤔 Assumptions and Areas for Improvement

**Assumptions Made:**

*   **Database Backend:** Assumed that the Drizzle ORM setup in the backend is configured to connect to a suitable database (like D1 or PostgreSQL) via Cloudflare Workers bindings. The local setup instructions provide guidance but the specific database connection details depend on the user's Cloudflare setup.
*   **API Client Error Handling:** Modified the `apiClient` to handle specific error structures for authentication endpoints based on the observed backend response format (`{ error: "..." }`). Assumed this structure is consistent for authentication-related errors.
*   **Authentication Flow:** Implemented a client-side JWT storage and user state management using Zustand. Assumed this approach is acceptable for the challenge.

**Areas for Improvement:**

*   **More Robust Form Validation:** While basic validation is in place, integrating a form library like React Hook Form or Formik could improve validation logic, error display, and form state management, especially for complex forms like Create Event.
*   **Enhanced Error Display:** Implement more user-friendly and detailed error messages on the frontend, potentially using toast notifications or dedicated error components for different types of errors (validation, API errors, network issues).
*   **Comprehensive Testing:** Add unit, integration, and end-to-end tests for both frontend and backend code to ensure reliability and prevent regressions.
*   **Loading States and UX:** Improve loading indicators and disable buttons more consistently during API calls to provide better user feedback.
*   **Pagination/Infinite Scrolling:** For event listings and bookings, implement pagination or infinite scrolling for better performance with a large number of entries.
*   **API Error Standardization:** Standardize error response formats from the backend API to make frontend error handling more consistent.
*   **Security Enhancements:** Implement more advanced security measures like rate limiting on API endpoints, stricter input sanitization, and potentially refresh tokens for JWTs.
*   **Frontend Routing Protection:** While pages check for `user?.id`, a more robust routing solution could potentially handle redirects at a higher level or show different layouts based on authentication status.

---

This README provides an overview of the project, implemented features, technical stac