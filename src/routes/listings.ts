import { Router } from "express";
import { ObjectId } from "mongodb";
import type { Filter } from "mongodb";
import { listingsCollection, usersCollection } from "../db";
import type { Listing } from "../types";

const router = Router();

// Lo que se enseña de cada anuncio en un listado
const LIST_FIELDS = { title: 1, price: 1, category: 1, city: 1, status: 1 };

function isNonEmptyText(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

// ---------- GET /api/listings (listado) ----------
// Filtros opcionales: ?category=, ?city=, ?maxPrice= (combinables)
router.get("/", async (req, res) => {
  const filter: Filter<Listing> = {};

  if (typeof req.query.category === "string") {
    filter.category = req.query.category;
  }

  if (typeof req.query.city === "string") {
    filter.city = req.query.city;
  }

  if (req.query.maxPrice !== undefined) {
    const raw = req.query.maxPrice;
    const maxPrice = typeof raw === "string" ? Number(raw) : NaN;

    if (typeof raw !== "string" || raw.trim() === "" || Number.isNaN(maxPrice)) {
      res.status(400).json({ error: "maxPrice debe ser un número" });
      return;
    }

    filter.price = { $lte: maxPrice };
  }

  const listings = await listingsCollection()
    .find(filter)
    .project(LIST_FIELDS)
    .sort({ publishedAt: -1 })
    .toArray();

  res.json(listings);
});

// ---------- POST /api/listings (publicar anuncio) ----------
router.post("/", async (req, res) => {
  const body = req.body ?? {};
  const { title, description, category, city, price, sellerId, attributes } = body;

  if (!isNonEmptyText(title) || !isNonEmptyText(description) || !isNonEmptyText(category) || !isNonEmptyText(city)) {
    res.status(400).json({ error: "title, description, category y city son obligatorios y no pueden estar vacíos" });
    return;
  }

  if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
    res.status(400).json({ error: "price debe ser un número mayor o igual que 0" });
    return;
  }

  if (typeof sellerId !== "string" || !ObjectId.isValid(sellerId)) {
    res.status(400).json({ error: "sellerId no tiene un formato válido" });
    return;
  }

  // MongoDB no comprueba las referencias: lo hacemos nosotros
  const seller = await usersCollection().findOne({ _id: new ObjectId(sellerId) });
  if (!seller) {
    res.status(400).json({ error: "No existe ningún usuario con ese sellerId" });
    return;
  }

  if (attributes !== undefined && (typeof attributes !== "object" || attributes === null || Array.isArray(attributes))) {
    res.status(400).json({ error: "attributes debe ser un objeto" });
    return;
  }

  // Construido campo a campo: nunca se guarda req.body tal cual
  const newListing: Listing = {
    title: title.trim(),
    description: description.trim(),
    price,
    category: category.trim(),
    status: "AVAILABLE",
    city: city.trim(),
    publishedAt: new Date(),
    views: 0,
    seller: { id: seller._id, name: seller.name },
    photos: [],
    attributes: attributes ?? {},
  };

  const result = await listingsCollection().insertOne(newListing);

  res.status(201).json({ _id: result.insertedId, ...newListing });
});

export default router;