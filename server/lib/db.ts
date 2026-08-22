import { MongoClient, type Db } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://2204caleb2007_db_user:ozuXZ1vQ6umh1NQj@workora.qycgy8i.mongodb.net/?appName=WORKORA";

const DB_NAME = "workora";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  console.log("Connected to MongoDB:", db.databaseName);
  return { client, db };
}

export default connectToDatabase;
