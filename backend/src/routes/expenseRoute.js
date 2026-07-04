import express from "express";
import { create, getAll, getById, update, deleteValue, getCategories } from "../controllers/expenseController.js";

const router = express.Router();

router.post("/", create);
router.get("/", getAll);
router.get("/categories", getCategories);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", deleteValue);


export default router;