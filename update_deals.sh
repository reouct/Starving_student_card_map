#!/bin/bash

cd server/data
echo "Running scraper..."
python3 scraper.py

echo "Copying deals to sampleData..."
cp scraped_deals.js ../sampleData/sampleDealsList.js

cd ../sampleData

echo "Dropping old deals collection..."
node dropDealCollection.js

echo "Posting new deals..."
node postSampleDealsToServer.js

echo "Done! Database updated."