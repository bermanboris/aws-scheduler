import express from "express";
import jobController from "../controllers/jobController";

const router = express.Router();

router.get("/", (req, res) => res.send("Cron API"));
router.post("/create", jobController.create);
router.get("/list", jobController.list);
router.delete("/delete/:id", jobController.delete);
router.get("/reload-jobs", jobController.reloadJobs);

export default router;
