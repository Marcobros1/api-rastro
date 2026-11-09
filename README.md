# api-rastro

API REST de Rastro, un mercado de segunda mano. Permite publicar anuncios, filtrarlos, hacer ofertas y consultar ofertas por anuncio. Usa Express 5 y MongoDB.

## Requisitos

- Node.js 24 o superior
- MongoDB 8 (en local, por ejemplo con Docker)

## Puesta en marcha

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea el archivo `.env` en la raíz a partir de `.env.example`:

   ```
   MONGODB_URI=mongodb://usuario:contraseña@localhost:27017/?authSource=admin
   DB_NAME=rastro
   ```

   `.env` no se sube a Git. `.env.example` sí, sin secretos.

3. Arranca la API con recarga automática:

   ```bash
   npm run dev
   ```

   Deberías ver:

   ```
   Conectado a MongoDB (base de datos rastro)
   Servidor escuchando en http://localhost:3000
   ```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Arranca el servidor con `tsx watch` |
| `npm run lint` | Revisa el código con ESLint |
| `npm run typecheck` | Comprueba los tipos de TypeScript sin compilar |

## Endpoints

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/health` | Comprueba que la API responde y que MongoDB está disponible | 200, 500 |
| GET | `/api/listings` | Lista anuncios. Filtros opcionales: `category`, `city`, `maxPrice` | 200, 400 |
| GET | `/api/listings/:id` | Ficha de un anuncio. Suma 1 a `views` en cada consulta | 200, 400, 404 |
| POST | `/api/listings` | Publica un anuncio | 201, 400 |
| PATCH | `/api/listings/:id` | Cambia el precio de un anuncio | 200, 400, 404 |
| DELETE | `/api/listings/:id` | Borra un anuncio | 204, 404 |
| GET | `/api/listings/:id/offers` | Ofertas de un anuncio | 200, 404 |
| POST | `/api/offers` | Hace una oferta por un anuncio | 201, 400, 409 |

### Ejemplos

Filtrar anuncios:

```bash
curl "http://localhost:3000/api/listings?category=Phones&city=Valencia&maxPrice=400"
```

Hacer una oferta:

```bash
curl -X POST http://localhost:3000/api/offers \
  -H "Content-Type: application/json" \
  -d '{"listingId":"670000000000000000000008","buyerId":"660000000000000000000002","amount":100}'
```

## Decisiones de diseño

- **Filtros construidos a mano.** `GET /api/listings` no pasa `req.query` a `find()`. Cada filtro se valida por separado, así el cliente no puede filtrar por campos que no queremos exponer.
- **Campos controlados por la API.** Al publicar, `status`, `views`, `publishedAt` y `photos` los decide el servidor. El cliente no puede enviarlos.
- **Copias en las ofertas.** Una oferta guarda `listing.title`, `listing.price` y `buyer.name` tal como estaban al hacerla. Si después cambia el precio del anuncio, la oferta no cambia.
- **Errores con código correcto.** Un dato mal formado da 400. Un anuncio que ya no está disponible da 409, porque la petición es válida pero el recurso ya no permite la acción.

## Estructura

```
src/
  index.ts          Servidor, rutas base y manejo de errores
  db.ts             Conexión a MongoDB y colecciones
  types.ts          Modelo de los documentos
  routes/
    listings.ts     Endpoints de anuncios
    offers.ts       Endpoint de ofertas
```

## Datos de prueba

Los datos de ejemplo (5 usuarios, 8 anuncios, 5 ofertas y 1 valoración) se cargan con el script del apartado 1.1 del enunciado. Si los tests de la API cambian los datos, repite ese apartado para empezar de cero.

## Ejercicio: mapa de partes

Cada parte del ejercicio está en su propia rama y su propia PR, fusionada en `main`.

| Parte | Rama | PR | Contenido |
|---|---|---|---|
| 1 | `feature/database-connection` | #1 | Conexión a MongoDB y `GET /api/health` |
| 2 | `feature/read-listings` | #2 | `GET /api/listings` y `GET /api/listings/:id` |
| 3 | `feature/listing-filters` | #3 | Filtros `category`, `city` y `maxPrice` |
| 4 | `feature/create-listing` | #4 | `POST /api/listings` |
| 5 | `feature/update-delete-listing` | #5 | `PATCH` y `DELETE` de anuncios |
| 6 | `feature/offers` | #6 | `POST /api/offers` y `GET /api/listings/:id/offers` |
