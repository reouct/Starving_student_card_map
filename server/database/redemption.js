// use redemption collection to track username, deal_id, num_uses
const { collections, ensureConnection } = require("./db");
const { dealDB } = require("./deal");

const redemptionCollection = collections.redemptionCollection;

async function getUsersRedemptions(userId) {
  await ensureConnection();

  return redemptionCollection
    .find({ userId }, { projection: { _id: 0 } })
    .toArray();
}

async function redeemDeal(userId, dealId) {
  await ensureConnection();

  const deal = await dealDB.getDeal(dealId);
  if (!deal) throw new Error("Deal not found");

  let redemption = await redemptionCollection.findOne({ userId, dealId });
  if (!redemption) {
    redemption = { userId, dealId, numUses: 0 };
    await redemptionCollection.insertOne(redemption);
  }

  if (deal.numUses !== null && redemption.uses >= deal.numUses) {
    throw new Error("Redemption limit reached");
  }

  await redemptionCollection.updateOne(
    { userId, dealId },
    { $inc: { numUses: 1 } }
  );

  redemption.numUses++;
  return { redemption };
}

async function getRedemption(userId, dealId) {
  await ensureConnection();

  const deal = await dealDB.getDeal(dealId);
  if (!deal) throw new Error("Deal not found");

  return redemptionCollection.findOne(
    { userId, dealId },
    { projection: { _id: 0 } }
  );
}

async function getDealRedemptions(dealId) {
  const deal = await dealDB.getDeal(dealId);
  if (!deal) throw new Error("Deal not found");

  await ensureConnection();
  return redemptionCollection
    .find({ dealId }, { projection: { _id: 0 } })
    .toArray();
}

async function updateUsersDealRedemption(userId, dealId, updatedNumUses) {
  await ensureConnection();

  const deal = await dealDB.getDeal(dealId);
  if (!deal) throw new Error("Deal not found");

  let redemption = await redemptionCollection.findOne({ userId, dealId });
  if (!redemption) {
    redemption = { userId, dealId, numUses: 0 };
    await redemptionCollection.insertOne(redemption);
  }

  if (
    deal.numUses !== null &&
    redemption.uses + updatedNumUses > deal.numUses
  ) {
    throw new Error(
      `Update failed! numUses (${updatedNumUses}) exceeds limit (${
        !!deal.numUses ? deal.numUses : "no limit"
      }) for deal ${deal.id}`
    );
  }

  await redemptionCollection.updateOne(
    { userId, dealId },
    { numUses: updatedNumUses }
  );
  return { userId, dealId, updatedNumUses };
}

async function deleteUsersRedemptions(userId) {
  await ensureConnection();
  const result = await redemptionCollection.deleteMany({ userId });
  return { success: true, deletedCount: result.deletedCount };
}

async function deleteRedemptionsForDeal(dealId) {
  const deal = await dealDB.getDeal(dealId);
  if (!deal) throw new Error("Deal not found");

  await ensureConnection();
  const result = await redemptionCollection.deleteMany({ dealId });
  return { success: true, deletedCount: result.deletedCount };
}

module.exports = {
  redemptionDB: {
    getUsersRedemptions,
    redeemDeal,
    getRedemption,
    getDealRedemptions,
    updateUsersDealRedemption,
    deleteUsersRedemptions,
    deleteRedemptionsForDeal,
  },
};
