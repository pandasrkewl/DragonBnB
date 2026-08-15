function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated. Please log in." });
  }
  next();
}

async function verifyUserInConversation(userId, conversationId, pool) {
  try {
    const result = await pool.query(
      `SELECT id FROM conversations 
       WHERE id = $1 AND (host_id = $2 OR guest_id = $2)`,
      [conversationId, userId],
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error("Error verifying conversation access:", err);
    return false;
  }
}

module.exports = { requireLogin, verifyUserInConversation };
