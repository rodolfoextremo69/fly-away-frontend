
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api';

interface Booking {
  id: number;
  bookingDate: string;
  flightId: number;
  flightNumber: string;
  airlineName: string;
  estDepartureTime: string;
  estArrivalTime: string;
  customerId: number;
  customerFirstName: string;
  customerLastName: string;
}

function BookingDetail() {
  const { id } = useParams();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarReserva = async () => {
      setLoading(true);

      try {
        const { data } = await api.get<Booking>(
          `/flights/book/${id}`
        );

        setBooking(data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.detail ??
            'No se pudo obtener la reserva'
          );
        } else {
          setError('Ocurrió un error inesperado');
        }
      } finally {
        setLoading(false);
      }
    };

    cargarReserva();
  }, [id]);

  const mostrarFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-PE');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>✈️ Fly Away Travel</h1>
        <h2>Detalle de reserva</h2>

        {loading && <p>Cargando reserva...</p>}

        {error && <p className="error">{error}</p>}

        {booking && (
          <div className="booking-detail">
            <p>
              <strong>ID de reserva:</strong> {booking.id}
            </p>

            <p>
              <strong>Pasajero:</strong>{' '}
              {booking.customerFirstName}{' '}
              {booking.customerLastName}
            </p>

            <p>
              <strong>Vuelo:</strong> {booking.flightNumber}
            </p>

            <p>
              <strong>Aerolínea:</strong> {booking.airlineName}
            </p>

            <p>
              <strong>Salida:</strong>{' '}
              {mostrarFecha(booking.estDepartureTime)}
            </p>

            <p>
              <strong>Llegada:</strong>{' '}
              {mostrarFecha(booking.estArrivalTime)}
            </p>

            <p>
              <strong>Fecha de reserva:</strong>{' '}
              {mostrarFecha(booking.bookingDate)}
            </p>
          </div>
        )}

        <Link to="/flights">Volver a los vuelos</Link>
      </div>
    </div>
  );
}

export default BookingDetail;
