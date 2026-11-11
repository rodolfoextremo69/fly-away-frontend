
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api';

interface Flight {
  id: number;
  flightNumber: string;
  airlineName: string;
  estDepartureTime: string;
  estArrivalTime: string;
  availableSeats: number;
}

interface Usuario {
  firstName: string;
  lastName: string;
  email: string;
}

function Flights() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);

  const [flightNumber, setFlightNumber] = useState('');
  const [airlineName, setAirlineName] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [loading, setLoading] = useState(false);
  const [reservando, setReservando] = useState<number | null>(null);
  const [reservaId, setReservaId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Usuario>('/users/current')
      .then(({ data }) => {
        setUsuario(data);
      })
      .catch(() => {
        setError('No se pudo cargar el usuario');
      });

    api.get('/flights/search')
      .then(({ data }) => {
        setFlights(data.items);
      })
      .catch(() => {
        setError('No se pudieron cargar los vuelos');
      });
  }, []);

  const buscarVuelos = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (from && to && new Date(from) > new Date(to)) {
      setError('La fecha inicial debe ser anterior a la final');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.get('/flights/search', {
        params: {
          flightNumber: flightNumber || undefined,
          airlineName: airlineName || undefined,
          estDepartureTimeFrom: from
            ? new Date(from).toISOString()
            : undefined,
          estDepartureTimeTo: to
            ? new Date(to).toISOString()
            : undefined,
        },
      });

      setFlights(data.items);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ?? 'Error al buscar vuelos'
        );
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setLoading(false);
    }
  };

  // NUEVA FUNCIÓN: reservar un vuelo
  const reservarVuelo = async (id: number) => {
    if (!localStorage.getItem('token') || !usuario) {
      navigate('/login');
      return;
    }

    setError('');
    setReservaId(null);
    setReservando(id);

    try {
      const { data } = await api.post('/flights/book', {
        flightId: id,
      });

      // Guardar el ID separado por usuario
      const key = `bookings:${usuario.email}`;

      const anteriores: number[] = JSON.parse(
        localStorage.getItem(key) ?? '[]'
      );

      const nuevos = [...new Set([...anteriores, data.id])];

      localStorage.setItem(key, JSON.stringify(nuevos));

      setReservaId(data.id);

      // Actualizar los asientos en la tabla
      const respuesta = await api.get('/flights/search');
      setFlights(respuesta.data.items);

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ??
          'No se pudo realizar la reserva'
        );
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setReservando(null);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const mostrarFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-PE');
  };

  return (
    <div className="flights-page">
      <div className="flights-container">

        <header className="flights-header">
          <div>
            <h1>✈️ Fly Away Travel</h1>
            <p>
              Bienvenido, {usuario
                ? `${usuario.firstName} ${usuario.lastName}`
                : 'usuario'}
            </p>
          </div>

          <div className="header-actions">
  <Link to="/my-bookings" className="nav-link">
    Mis reservas
  </Link>

            <button onClick={cerrarSesion}>
                Cerrar sesión
            </button>
            </div>
        </header>

        <section className="search-card">
          <h2>Buscar vuelos</h2>

          <form onSubmit={buscarVuelos}>
            <div className="search-grid">

              <div>
                <label>Número de vuelo</label>
                <input
                  type="text"
                  placeholder="Ejemplo: LA101"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                />
              </div>

              <div>
                <label>Aerolínea</label>
                <input
                  type="text"
                  placeholder="Ejemplo: LATAM"
                  value={airlineName}
                  onChange={(e) => setAirlineName(e.target.value)}
                />
              </div>

              <div>
                <label>Salida desde</label>
                <input
                  type="datetime-local"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>

              <div>
                <label>Salida hasta</label>
                <input
                  type="datetime-local"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>

            <button
              className="search-button"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar vuelos'}
            </button>
          </form>
        </section>

        {error && (
          <div className="booking-error">
            {error}
          </div>
        )}

        {reservaId !== null && (
          <div className="booking-success">
            <h3>¡Reserva realizada correctamente!</h3>

            <p>Tu ID de reserva es: <strong>{reservaId}</strong></p>

            <Link to={`/booking/${reservaId}`}>
              Ver detalle de mi reserva
            </Link>
          </div>
        )}

        <section className="results-card">
          <h2>Vuelos disponibles</h2>

          {flights.length === 0 ? (
            <p>No se encontraron vuelos con esos filtros.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Aerolínea</th>
                    <th>Salida</th>
                    <th>Llegada</th>
                    <th>Asientos</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {flights.map((flight) => (
                    <tr key={flight.id}>
                      <td>{flight.flightNumber}</td>
                      <td>{flight.airlineName}</td>

                      <td>
                        {mostrarFecha(flight.estDepartureTime)}
                      </td>

                      <td>
                        {mostrarFecha(flight.estArrivalTime)}
                      </td>

                      <td>{flight.availableSeats}</td>

                      <td>
                        <button
                          className="booking-button"
                          disabled={
                            reservando !== null ||
                            !usuario ||
                            flight.availableSeats <= 0
                          }
                          onClick={() => reservarVuelo(flight.id)}
                        >
                          {reservando === flight.id
                            ? 'Reservando...'
                            : 'Reservar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default Flights;
