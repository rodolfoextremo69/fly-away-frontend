
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

interface Booking {
  id: number;
  flightNumber: string;
  airlineName: string;
  estDepartureTime: string;
  estArrivalTime: string;
  customerId: number;
}

interface Usuario {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

function MyBookings() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [reservas, setReservas] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    const cargarReservas = async () => {
      try {
        // Obtener el usuario autenticado
        const { data: me } = await api.get<Usuario>(
          '/users/current'
        );

        if (!activo) return;
        setUsuario(me);

        // Obtener los IDs guardados para este usuario
        const key = `bookings:${me.email}`;

        const guardados = JSON.parse(
          localStorage.getItem(key) ?? '[]'
        );

        const ids: number[] = Array.isArray(guardados)
          ? guardados.filter(
              (id): id is number =>
                typeof id === 'number' &&
                Number.isInteger(id) &&
                id > 0
            )
          : [];

        // Consultar cada reserva en el backend
        const resultados = await Promise.allSettled(
          ids.map((id) =>
            api.get<Booking>(`/flights/book/${id}`)
          )
        );

        // Solo mostrar reservas pertenecientes al usuario
        const reservasValidas = resultados.flatMap((resultado) => {
          if (
            resultado.status === 'fulfilled' &&
            resultado.value.data.customerId === me.id
          ) {
            return [resultado.value.data];
          }

          return [];
        });

        if (activo) {
          setReservas(reservasValidas);
        }

      } catch {
        if (activo) {
          setError('No se pudieron cargar tus reservas');
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    cargarReservas();

    return () => {
      activo = false;
    };
  }, []);

  const mostrarFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-PE');
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="flights-page">
      <div className="flights-container">

        <header className="flights-header">
          <div>
            <h1>✈️ Fly Away Travel</h1>
            <p>
              {usuario
                ? `${usuario.firstName} ${usuario.lastName}`
                : 'Mis reservas'}
            </p>
          </div>

          <div className="header-actions">
            <Link to="/flights" className="nav-link">
              Buscar vuelos
            </Link>

            <button onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className="results-card">
          <h2>Mis reservas</h2>

          {loading && <p>Cargando reservas...</p>}

          {error && <p className="error">{error}</p>}

          {!loading && !error && reservas.length === 0 && (
            <p>
              Todavía no tienes reservas guardadas.
              Busca un vuelo y realiza tu primera reserva.
            </p>
          )}

          {!loading && reservas.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Vuelo</th>
                    <th>Aerolínea</th>
                    <th>Salida</th>
                    <th>Detalle</th>
                  </tr>
                </thead>

                <tbody>
                  {reservas.map((reserva) => (
                    <tr key={reserva.id}>
                      <td>{reserva.id}</td>
                      <td>{reserva.flightNumber}</td>
                      <td>{reserva.airlineName}</td>

                      <td>
                        {mostrarFecha(reserva.estDepartureTime)}
                      </td>

                      <td>
                        <Link to={`/booking/${reserva.id}`}>
                          Ver detalle
                        </Link>
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

export default MyBookings;
