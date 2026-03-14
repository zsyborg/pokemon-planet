import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { MongoClient } from "mongodb";

const folder = "./csv";
const uri = "mongodb+srv://techzasha:Ajna4028@dharti.ctgvhra.mongodb.net/Pokemon?appName=Dharti";
const dbName = "pokemon";

async function run() {
  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(dbName);

  const files = fs.readdirSync(folder);

  for (const file of files) {
    if (!file.endsWith(".csv")) continue;

    const collectionName = path.basename(file, ".csv");
    const collection = db.collection(collectionName);

    const records = [];

    await new Promise((resolve) => {
      fs.createReadStream(`${folder}/${file}`)
        .pipe(csv())
        .on("data", (data) => records.push(data))
        .on("end", resolve);
    });

    if (records.length) {
      await collection.insertMany(records);
      console.log(`Imported ${file} → ${collectionName}`);
    }
  }

  await client.close();
}

run();
