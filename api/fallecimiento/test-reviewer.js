import { requireReviewer } from "./_requireReviewer.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { user, error } = await requireReviewer(req);

  if (error) {
    return res.status(error.status).json({
      error: error.message,
    });
  }

  return res.status(200).json({
    authorized: true,
    userId: user.id,
  });
}