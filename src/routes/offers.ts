import { Router } from "express";
import { ObjectId } from "mongodb";
import { listingsCollection, offersCollection, usersCollection } from "../db";
import type { Offer } from "../types";

const router = Router();

// Un ObjectId válido son exactamente 24 caracteres hexadecimales
const isObjectIdString = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);

// ---------- POST /api/offers (hacer una oferta) ----------
router.post("/", async (req, res) => {
  const { listingId, buyerId, amount } = req.body ?? {};

  // 1. Formato de los ids
  if (!isObjectIdString(listingId) || !isObjectIdString(buyerId)) {
    res.status(400).json({ error: "listingId y buyerId deben ser ObjectId válidos" });
    return;
  }

  // 2. El importe es un número mayor que 0
  if (typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ error: "amount debe ser un número mayor que 0" });
    return;
  }

  // 3. El anuncio existe
  const listing = await listingsCollection().findOne({ _id: new ObjectId(listingId) });
  if (!listing) {
    res.status(400).json({ error: "El anuncio no existe" });
    return;
  }

  // 4. El comprador existe
  const buyer = await usersCollection().findOne({ _id: new ObjectId(buyerId) });
  if (!buyer) {
    res.status(400).json({ error: "El comprador no existe" });
    return;
  }

  // 5. El anuncio sigue disponible
  if (listing.status !== "AVAILABLE") {
    res.status(409).json({ error: "El anuncio no está disponible" });
    return;
  }

  // Copias de título, precio y nombre tal como están en este momento
  const offer: Offer = {
    amount,
    status: "PENDING",
    createdAt: new Date(),
    listing: { id: listing._id, title: listing.title, price: listing.price },
    buyer: { id: buyer._id, name: buyer.name },
  };

  const result = await offersCollection().insertOne(offer);

  res.status(201).json({ _id: result.insertedId, ...offer });
});

// ---------- PATCH /api/offers/:id (aceptar o rechazar oferta) ----------
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body ?? {};

  if (!isObjectIdString(id)) {
    res.status(400).json({ error: "El id de la oferta no es válido" });
    return;
  }

  if (status !== "ACCEPTED" && status !== "REJECTED") {
    res.status(400).json({ error: "El estado debe ser ACCEPTED o REJECTED" });
    return;
  }

  const offer = await offersCollection().findOne({ _id: new ObjectId(id) });
  if (!offer) {
    res.status(404).json({ error: "La oferta no existe" });
    return;
  }

  // Si se acepta, el anuncio pasa a RESERVED
  if (status === "ACCEPTED") {
    await listingsCollection().findOneAndUpdate(
      { _id: new ObjectId(offer.listing.id) },
      { $set: { status: "RESERVED" } }
    );
  }

  await offersCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status } }
  );

  const updated = await offersCollection().findOne({ _id: new ObjectId(id) });
  res.json(updated);
});

export default router;
