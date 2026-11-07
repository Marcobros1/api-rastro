import { Router } from "express";
import type { Filter } from "mongodb";
import { listingsCollection } from "../db";
import type { Listing } from "../types";

const router = Router();

// Lo que se enseña de cada anuncio en un listado
const LIST_FIELDS = { title: 1, price: 1, category: 1, city: 1, status: 1 };

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

export default router;