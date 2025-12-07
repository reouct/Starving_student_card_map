const express = require("express");
const { redemptionDB } = require("../database/redemption");
const { authRouter } = require("./auth");

const redemptionRouter = express.Router();

redemptionRouter.endpoints = [
  {
    method: "POST",
    path: "/api/redemption/:dealId/redeem",
    requiresAuth: true,
    description: "Redeem a deal for the authenticated user",
    example: `curl -X POST localhost:3000/api/redemption/deal-uuid/redeem -H 'Authorization: Bearer tttttt'`,
    response: {
      success: true,
      redemption: {
        userId: "uuid",
        dealId: "uuid",
        numUses: 1,
      },
    },
  },
  {
    method: "POST",
    path: "/api/redemption",
    requiresAuth: true,
    description: "Edit/add a user's redemption (admin only)",
    example: `curl -X POST localhost:3000/api/redemption -d '{"userId":"uuid","dealId":"uuid","updatedNumUses":2}' -H 'Content-Type: application/json' -H 'Authorization: Bearer tttttt'`,
    response: { userId: "uuid", dealId: "uuid", numUses: 2 },
  },
  {
    method: "GET",
    path: "/api/redemption/user/:userId/deal/:dealId",
    requiresAuth: true,
    description:
      "Get a redemption for a specific user and deal (self or admin)",
    example: `curl -X GET localhost:3000/api/redemption/user/uuid/deal/uuid -H 'Authorization: Bearer tttttt'`,
    response: {
      userId: "uuid",
      dealId: "uuid",
      numUses: 1,
    },
  },
  {
    method: "GET",
    path: "/api/redemption/deal/:dealId",
    requiresAuth: true,
    description: "List redemptions for a specific deal (admin only)",
    example: `curl -X GET localhost:3000/api/redemption/deal/uuid -H 'Authorization: Bearer tttttt'`,
    response: {
      redemptions: [{ userId: "uuid", dealId: "uuid", numUses: 1 }],
    },
  },
  {
    method: "GET",
    path: "/api/redemption/user/:userId",
    requiresAuth: true,
    description: "List redemptions for a user (self or admin)",
    example: `curl -X GET localhost:3000/api/redemption/user/uuid -H 'Authorization: Bearer tttttt'`,
    response: {
      redemptions: [{ userId: "uuid", dealId: "uuid", numUses: 1 }],
    },
  },
  {
    method: "DELETE",
    path: "/api/redemption/deal/:dealId",
    requiresAuth: true,
    description: "Delete all redemptions for a specific deal (admin only)",
    example: `curl -X DELETE localhost:3000/api/redemption/deal/uuid -H 'Authorization: Bearer tttttt'`,
    response: { success: true, deletedCount: 3 },
  },
  {
    method: "DELETE",
    path: "/api/redemption/user/:userId",
    requiresAuth: true,
    description: "Delete all redemptions for a user (admin only)",
    example: `curl -X DELETE localhost:3000/api/redemption/user/uuid -H 'Authorization: Bearer tttttt'`,
    response: { success: true, deletedCount: 3 },
  },
];

// Redeem a deal for an authenticated user
redemptionRouter.post(
  "/:dealId/redeem",
  authRouter.authenticateToken,
  async (req, res) => {
    try {
      const authUser = req.user;
      const dealId = req.params.dealId;
      if (!dealId) {
        return res
          .status(400)
          .send({ message: "Missing required param: dealId" });
      }

      let providedUserId = authUser.id;

      const redemption = await redemptionDB.redeemDeal(providedUserId, dealId);
      if (!redemption) {
        return res.status(400).send({ message: "Failed to redeem deal" });
      }

      res.send({ success: true, redemption });
    } catch (err) {
      res.status(500).send({ message: err.message || "Failed to redeem deal" });
    }
  }
);

// Edit a redemption (admin only — can create for any user)
redemptionRouter.post("/", authRouter.authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user.isRole("admin")) {
      return res.status(403).send({ message: "Unauthorized" });
    }
    const payload = req.body || {};
    const { userId: providedUserId, dealId } = payload;
    let { updatedNumUses } = payload;

    // Basic validation
    if (!dealId) {
      return res
        .status(400)
        .send({ message: "Missing required field: dealId" });
    }
    if (updatedNumUses === undefined) {
      return res
        .status(400)
        .send({ message: "Missing required field: updatedNumUses" });
    }
    updatedNumUses = Number(updatedNumUses);
    if (!Number.isFinite(updatedNumUses) || updatedNumUses < 0) {
      return res
        .status(400)
        .send({ message: "updatedNumUses must be a non-negative number" });
    }

    if (!providedUserId) {
      return res
        .status(400)
        .send({ message: "Missing required field: userId" });
    }
    const updateRes = await redemptionDB.updateUsersDealRedemption(
      providedUserId,
      dealId,
      updatedNumUses
    );
    res.send(updateRes);
    res.status.send(updateRes);
  } catch (err) {
    res
      .status(400)
      .send({ message: err.message || "Failed to update redemption" });
  }
});

// Get a redemption for a specific user and deal (user themselves or admin)
redemptionRouter.get(
  "/user/:userId/deal/:dealId",
  authRouter.authenticateToken,
  async (req, res) => {
    try {
      const authUser = req.user;
      const userId = req.params.userId;
      const dealId = req.params.dealId;

      if (!userId) {
        return res
          .status(400)
          .send({ message: "Missing required param: userId" });
      }
      if (!dealId) {
        return res
          .status(400)
          .send({ message: "Missing required param: dealId" });
      }

      const requesterId = authUser.id;
      // Allow if requesting their own redemption or if admin
      if (requesterId !== userId && !authUser.isRole("admin")) {
        return res.status(403).send({ message: "Unauthorized" });
      }

      const redemption = await redemptionDB.getRedemption(userId, dealId);
      if (!redemption) {
        return res.status(404).send({ message: "Redemption not found" });
      }

      res.send({ ...redemption });
    } catch (err) {
      res
        .status(500)
        .send({ message: err.message || "Failed to fetch redemption" });
    }
  }
);

// Get redemptions for a specific deal (admin only)
redemptionRouter.get(
  "/deal/:dealId",
  authRouter.authenticateToken,
  async (req, res) => {
    try {
      const user = req.user;
      if (!user.isRole("admin")) {
        return res.status(403).send({ message: "Unauthorized" });
      }

      const dealId = req.params.dealId;
      if (!dealId) {
        return res
          .status(400)
          .send({ message: "Missing required query param: dealId" });
      }

      const redemptions = await redemptionDB.getDealRedemptions(dealId);
      res.send(redemptions);
    } catch (err) {
      res
        .status(500)
        .send({ message: err.message || "Failed to fetch deal redemptions" });
    }
  }
);

// Get redemptions for a user
redemptionRouter.get(
  "/user/:userId",
  authRouter.authenticateToken,
  async (req, res) => {
    try {
      const authUser = req.user;
      const userId = req.params.userId;

      if (!userId) {
        return res
          .status(400)
          .send({ message: "Missing required param: userId" });
      }

      // Allow if requesting their own redemptions or if admin
      if (authUser.id !== userId && !authUser.isRole("admin")) {
        return res.status(403).send({ message: "Unauthorized" });
      }

      const redemptions = await redemptionDB.getUsersRedemptions(userId);
      res.send(redemptions);
    } catch (err) {
      res
        .status(500)
        .send({ message: err.message || "Failed to fetch user's redemptions" });
    }
  }
);

// Delete all redemptions for a  specific deal (admin only)
redemptionRouter.delete(
  "/deal/:dealId",
  authRouter.authenticateToken,
  async (req, res) => {
    try {
      const user = req.user;
      if (!user.isRole("admin")) {
        return res.status(403).send({ message: "Unauthorized" });
      }
      const dealId = req.params.dealId;
      const { success, deletedCount } =
        await redemptionDB.deleteRedemptionsForDeal(dealId);

      if (!success) {
        return res.status(500).send({
          message: "Delete operation was not acknowledged by the database",
        });
      }
      if (deletedCount == 0)
        return res
          .status(404)
          .send({ message: "No redemptions found for specified deal" });
      res.send({ success: true });
    } catch (err) {
      res.status(500).send({
        message: err.message || "Failed to delete deal's redemptions",
      });
    }
  }
);

// Delete all redemptions for a user (admin only).
redemptionRouter.delete(
  "/user/:userId",
  authRouter.authenticateToken,
  async (req, res) => {
    try {
      const user = req.user;
      if (!user.isRole("admin")) {
        return res.status(403).send({ message: "Unauthorized" });
      }
      const userId = req.params.userId;

      const { success, deletedCount } =
        await redemptionDB.deleteUsersRedemptions(userId);

      if (!success) {
        return res.status(500).send({
          message: "Delete operation was not acknowledged by the database",
        });
      }

      if (deletedCount === 0) {
        return res.status(404).send({
          message: "No redemptions found for specified user",
        });
      }

      res.send({ success, deletedCount });
    } catch (err) {
      res.status(500).send({
        message: err.message || "Failed to delete user's redemptions",
      });
    }
  }
);

module.exports = redemptionRouter;
