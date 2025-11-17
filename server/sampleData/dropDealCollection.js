// sampleData/dropDealCollection.js
const { client, ensureConnection, collections } = require("../database/db");

async function dropDeals() {
  try {
    // This waits for the async connection to finish
    await ensureConnection();

    // Now the collections are ready
    const dealCollection = collections.dealCollection;

    const result = await dealCollection.drop();
    console.log(`Collection 'deal' dropped successfully:`, result);
  } catch (error) {
    if (error.message.includes("ns not found") || error.codeName === "NamespaceNotFound") {
      console.log("Collection 'deal' does not exist – nothing to drop");
    } else {
      console.error("Error dropping collection:", error.message);
    }
  } finally {
    await client.close();
    console.log("Disconnected from database");
  }
}

// Run it
dropDeals();