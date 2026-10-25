import { Router } from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { requireUser } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = Router();

router.use(requireUser);

router.get("/", getWishlist);
router.post(
  "/",
  validateObjectId("body", "carId", "Invalid car id"),
  addToWishlist,
);
router.delete(
  "/:carId",
  validateObjectId("params", "carId", "Invalid car id"),
  removeFromWishlist,
);

export default router;
