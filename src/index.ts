import express from "express";
import type { NextFunction, Request, Response } from "express";
import { connectDb, getDb, listingsCollection } from "./db";
import listingsRouter from "./routes/listings";
import { ObjectId } from "mongodb";

const app = express();
const PORT = 3000;

app.use("/api/listings", listingsRouter);
// 1. Registrar cada petición en la terminal
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 2. Leer bodies JSON
app.use(express.json());

// 3. Rutas
app.get("/api/health", async (_req, res) => {
  await getDb().command({ ping: 1 }); // pregunta a MongoDB "¿estás ahí?"
  res.json({ status: "ok", db: getDb().databaseName });
});

app.get("/api/listings/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: "El id del anuncio no es válido" });
    return;
  }

  const listing = await listingsCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $inc: { views: 1 } },
    { returnDocument: "after" }
  );

  if (!listing) {
    res.status(404).json({ error: "Anuncio no encontrado" });
    return;
  }

  res.json(listing);
});

// (aquí irán los routers de las próximas partes)

// 4. Ninguna ruta ha respondido: 404
app.use((req, res) => {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.url}` });
});

// 5. Ha ocurrido un error: respuesta JSON sin detalles internos
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: "El body no es un JSON válido" });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

async function start() {
  await connectDb();

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

start();