import express from "express";

const router = express.Router();

/**
 * GET /api/health
 * Trivial liveness check — no auth, no DB query. Just confirms the
 * Express process is up and responding. Used by the client's
 * serverStatus.js to distinguish "network is fine but our backend
 * is down" from genuine offline states.
 */
router.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default router;