
import MyBookings from './pages/MyBookings';
import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import type { ReactNode } from 'react';

import Register from './pages/Register';
import Login from './pages/Login';
import Flights from './pages/Flights';
import BookingDetail from './pages/BookingDetail';

import './App.css';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/my-bookings"
          element={
          <ProtectedRoute>
          <MyBookings />
           </ProtectedRoute>
           }
        />
        <Route
          path="/"
          element={<Navigate to="/flights" replace />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/flights"
          element={
            <ProtectedRoute>
              <Flights />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute>
              <BookingDetail />
            </ProtectedRoute>
          }
        />


        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
