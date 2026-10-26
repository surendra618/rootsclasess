import app from '../App.js';
import connectdb from '../config/connectdb.js';

export default async function handler(req, res) {
  try {
    await connectdb();
  } catch (err) {
    console.error("MongoDB connection error in serverless handler:", err);
  }
  return app(req, res);
}
