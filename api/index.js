import app from '../Backend/App.js';
import connectdb from '../Backend/config/connectdb.js';

export default async function handler(req, res) {
  try {
    await connectdb();
  } catch (err) {
    console.error("MongoDB connection error in root serverless handler:", err);
  }
  return app(req, res);
}
