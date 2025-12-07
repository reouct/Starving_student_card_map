const request = require("supertest");
const app = require("../service");
const { userDB } = require("../database/user");
const { dealDB } = require("../database/deal");
const { redemptionDB } = require("../database/redemption");
const redemption = require("../database/redemption");

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
  jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

function randomName() {
  return Math.random().toString(36).substring(2, 12);
}

async function createAdminUser() {
  const user = {
    username: randomName() + "@admin.com",
    password: "toomanysecrets",
    role: "admin",
  };
  return await userDB.createUser(user);
}

let testAdminUser;
let testUser1;
let testUser2;
let testDeal1;
let testDeal2;
let testDeal3;

async function addTestUsers() {
  // Create admin user
  testAdminUser = await createAdminUser();
  const adminLoginRes = await request(app).put("/api/auth").send({
    username: testAdminUser.username,
    password: testAdminUser.password,
  });
  testAdminUser.token = adminLoginRes.body.token;

  // Create regular user
  testUser1 = {
    username: randomName() + "@user1.com",
    password: "secret1",
    role: "user",
  };
  const testUser1Res = await request(app).post("/api/auth").send(testUser1);
  testUser1.token = testUser1Res.body.token;
  testUser1.id = testUser1Res.body.user.id;

  // Create another regular user
  testUser2 = {
    username: randomName() + "@user2.com",
    password: "secret2",
    role: "user",
  };
  const testUser2Res = await request(app).post("/api/auth").send(testUser2);
  testUser2.token = testUser2Res.body.token;
  testUser2.id = testUser2Res.body.user.id;
}

async function addTestDeals() {
  testDeal1 = {
    type: "Pizza",
    numUses: 1,
    storeName: "Malawi's Pizza",
    description: "Buy Any Pizza or Salad, Get One Free!",
    addresses: ["4801 N University Ave #110, Provo, UT 84604"],
  };
  const testDeal1Res = await request(app).post("/api/deal").send(testDeal1);
  testDeal1 = testDeal1Res.body;

  testDeal2 = {
    type: "Pizza",
    numUses: 1,
    storeName: "Pier 49 Pizza",
    description: "2-4-1 Pizza!",
    addresses: ["3210 N University Ave, Provo, UT 84604"],
  };
  const testDeal2Res = await request(app).post("/api/deal").send(testDeal2);
  testDeal2 = testDeal2Res.body;

  testDeal3 = {
    type: "Restaurants",
    numUses: 2,
    storeName: "Costa Vida",
    description: "Buy 1 Entree and 2 Drinks, Get 1 Entree Free!",
    addresses: ["1200 N University Ave, Provo, UT 84604"],
  };
  const testDeal3Res = await request(app).post("/api/deal").send(testDeal3);
  testDeal3 = testDeal3Res.body;
}

beforeAll(async () => {
  await addTestUsers();
  await addTestDeals();
});

afterAll(async () => {
  // Optional cleanup
  await userDB.deleteUser(testAdminUser.id);
  await userDB.deleteUser(testUser1.id);
  await userDB.deleteUser(testUser2.id);
  await dealDB.deleteDeal(testDeal1.id);
  await dealDB.deleteDeal(testDeal2.id);
  await dealDB.deleteDeal(testDeal3.id);
});

function expectRedemption(res, { userId, dealId, numUses }) {
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);

  const r = res.body.redemption;
  expect(r).toBeDefined();
  expect(r.userId).toBe(userId);
  expect(r.dealId).toBe(dealId);
  expect(r.numUses).toBe(numUses);
}

describe("redeem", () => {
  test("works multiple times per deal (within limit) per user", async () => {
    testDealId = testDeal3.id;
    const res = await request(app)
      .post(`/api/redemption/${testDealId}/redeem`)
      .set("Authorization", `Bearer ${testUser1.token}`);

    let expectedRedemption = {
      userId: testUser1.id,
      dealId: testDealId,
      numUses: 1,
    };

    expectRedemption(res, expectedRedemption);

    const res2 = await request(app)
      .post(`/api/redemption/${testDealId}/redeem`)
      .set("Authorization", `Bearer ${testUser1.token}`);

    expectedRedemption.numUses++;
    expectRedemption(res, expectedRedemption);

    // await redemptionDB.deleteRedemption(
    //   expectedRedemption.userId,
    //   expectedRedemption.dealId
    // );
  });

  test("does not redeem when deals numUses limit is met ", async () => {
    testDealId = testDeal1.id;
    let res;
    for (i = 0; i <= testDeal1.numUses; i++) {
      res = await request(app)
        .post(`/api/redemption/${testDealId}/redeem`)
        .set("Authorization", `Bearer ${testUser1.token}`);
    }

    expect(res.status).toBe(500);

    expect(res.body.message).toBe("Redemption limit reached");
    await redemptionDB.deleteRedemption(testUser1.id, testDealId.dealId);
  });
});

describe("delete redemptions", () => {
  test("admin can delete redemptions for user", async () => {});
});
