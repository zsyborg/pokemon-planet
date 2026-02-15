import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { MongoClient } from "mongodb";

// Configuration
const CSV_FOLDER = "./csv";  // Your CSV files folder
const DB_NAME = "Pokemon";   // Database name

// Get MongoDB URI from environment or use local default
// For MongoDB Atlas, set MONGODB_URI in your .env file
// Example: mongodb+srv://<username>:<password>@cluster.mongodb.net/pokemon?retryWrites=true&w=majority
const uri = process.env.MONGODB_URI || "mongodb+srv://techzasha:Ajna4028@dharti.ctgvhra.mongodb.net/Pokemon?appName=Dharti";

const BATCH_SIZE = 1000;  // Insert records in batches

interface Results {
  [key: string]: string;
}

async function importCSVToMongoDB() {
  console.log("=".repeat(50));
  console.log("CSV to MongoDB Import Script");
  console.log("=".repeat(50));
  console.log(`MongoDB URI: ${uri.replace(/\/\/.*:.*@/, "//****:****@")}`); // Hide credentials
  console.log(`Database: ${DB_NAME}`);
  console.log(`CSV Folder: ${CSV_FOLDER}`);
  console.log("=".repeat(50));

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db(DB_NAME);
    const files = fs.readdirSync(CSV_FOLDER).filter(f => f.endsWith(".csv"));

    console.log(`Found ${files.length} CSV files to import\n`);

    for (const file of files) {
      const collectionName = path.basename(file, ".csv");
      
      try {
        console.log(`📦 Processing: ${file}`);
        
        // Read CSV file
        const records: Results[] = await new Promise((resolve, reject) => {
          const results: Results[] = [];
          fs.createReadStream(path.join(CSV_FOLDER, file))
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", () => resolve(results))
            .on("error", reject);
        });

        if (records.length === 0) {
          console.log(`   ⚠️  No records found in ${file}\n`);
          continue;
        }

        // Clear existing collection to avoid duplicates
        await db.collection(collectionName).deleteMany({});
        console.log(`   🗑️  Cleared existing collection: ${collectionName}`);

        // Insert in batches
        let inserted = 0;
        for (let i = 0; i < records.length; i += BATCH_SIZE) {
          const batch = records.slice(i, i + BATCH_SIZE);
          await db.collection(collectionName).insertMany(batch);
          inserted += batch.length;
          console.log(`   📥 Inserted ${Math.min(i + BATCH_SIZE, records.length)}/${records.length} records`);
        }

        console.log(`   ✅ Imported ${inserted} records to collection: ${collectionName}\n`);

      } catch (err) {
        console.error(`   ❌ Error importing ${file}:`, err);
      }
    }

    console.log("=".repeat(50));
    console.log("🎉 Import complete!");
    console.log("=".repeat(50));

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Collections in ${DB_NAME}:`);
    collections.forEach(c => console.log(`   - ${c.name}`));

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n🔌 MongoDB connection closed");
  }
}

// Run the import
importCSVToMongoDB();
