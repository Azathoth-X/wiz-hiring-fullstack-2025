import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import { ThemeProvider } from './components/theme-provider.tsx'
import Layout from './components/layout.tsx'
import EventsPage from './pages/events.tsx'
import EventDetailsPage from './pages/event-details.tsx'
import CreateEventPage from './pages/create-event.tsx'
import MyBookingsPage from './pages/my-bookings.tsx'
import LoginPage from './pages/login.tsx'
import SignupPage from './pages/signup.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider storageKey='vite-ui-theme'>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/signup' element={<SignupPage/>}/>
          <Route element={<Layout/>}>
            <Route path='/' element={<App/>}/>
            <Route path='/events' element={<EventsPage/>}/>
            <Route path='/events/:id' element={<EventDetailsPage/>}/>
            <Route path='/create-event' element={<CreateEventPage/>}/>
            <Route path='/bookings' element={<MyBookingsPage/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
