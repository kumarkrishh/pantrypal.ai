import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please add your Mongo URI to .env');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  global._mongoClientPromise = client.connect().catch(err => {
    console.error('Failed to connect to MongoDB', err);
    throw err;
  });
}
clientPromise = global._mongoClientPromise;

async function connectToDatabase() {
  const client = await clientPromise;
  return client.db('recipeApp');
}

async function insertRecipe(recipe: any) {
  const db = await connectToDatabase();
  const collection = db.collection('recipes');
  const result = await collection.insertOne(recipe);
  return result;
}

export { connectToDatabase, insertRecipe };