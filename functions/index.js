const functions = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
  conf: { distDir: "nextApp/.next" },
});
const handle = app.getRequestHandler();

exports.nextApp = functions.onRequest(
  {
    region: "us-central1", // or your preferred region
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async (req, res) => {
    logger.info("Preparing Next.js app...");
    await app.prepare();
    return handle(req, res);
  }
);