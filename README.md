# Fly Away Travel - Frontend

Aplicación web de reserva de vuelos desarrollada para el Laboratorio de la Semana 14 del curso CS2031 - Desarrollo Basado en Plataformas.

## Tecnologías utilizadas

- React + TypeScript
- Vite
- Axios
- React Router
- CSS
- Backend Java 26 + Spring Boot
- Base de datos H2 en memoria

## Funcionalidades

- Registro de usuarios con validaciones.
- Inicio de sesión mediante JWT.
- Visualización de información del usuario autenticado.
- Búsqueda de vuelos por número y aerolínea.
- Filtrado de vuelos por rango de fechas.
- Reserva de vuelos para usuarios autenticados.
- Visualización del detalle de una reserva.
- Listado de reservas del usuario.
- Manejo de errores de reserva.
- Cierre de sesión y protección de rutas.

## Requisitos

- Java JDK 26
- Node.js compatible con Vite
- Git

## Ejecución del backend

Clonar el repositorio:

```bash
git clone https://github.com/CS2031-DBP/cs2031-2026-2-week14-fly-away-backend.git
```

Ingresar a la carpeta del backend y ejecutar en Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

El backend se ejecuta en:

`http://localhost:8080`

No requiere Docker ni PostgreSQL.

## Ejecución del frontend

Ingresar a la carpeta `fly-away-frontend` y ejecutar:

```powershell
npm.cmd install
npm.cmd run dev
```

Abrir en el navegador:

`http://localhost:5173`

## Usuario de prueba

- Correo: ana.garcia@utec.edu.pe
- Contraseña: Password1

También se pueden registrar nuevos usuarios desde la aplicación.

## Compilación

```powershell
npm.cmd run build
```

La versión de producción se genera en la carpeta `dist`.

## Observaciones

El backend utiliza una base de datos H2 en memoria, por lo que las reservas y los usuarios nuevos se pierden al reiniciar el servidor.

Los IDs de reserva se almacenan en el localStorage del navegador, separados por usuario.