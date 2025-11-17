// use authCollection to track username, authtoken
const { collections, ensureConnection } = require("./db");

const token_ttl = 7 * 24 * 60 * 60 * 1000;

async function loginUser(userId, tokenSignature) {
  await ensureConnection();
  await collections.authCollection.insertOne({
    tokenSignature,
    userId,
    createdAt: Date().now,
    expiresAt: Date(Date().now + token_ttl),
  });
}

async function isLoggedIn(tokenSignature) {
  await ensureConnection();
  const result = await collections.authCollection.findOne({ tokenSignature });
  return !!result;
}

async function logoutUser(tokenSignature) {
  await ensureConnection();
  await collections.authCollection.deleteOne({ tokenSignature });
}

module.exports = {
  authDB: {
    loginUser,
    isLoggedIn,
    logoutUser,
  },
};
