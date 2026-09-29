import mongoose from 'mongoose';

const mongoUrl = "mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0";

const testSchema = new mongoose.Schema({
  className: String,
}, { strict: false });

const Test = mongoose.model("Test", testSchema);

async function fixTestClasses() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB!");

    // Update the two newly created tests to be 11th class so the current student can see them
    const result = await Test.updateMany(
      { title: { $in: ["CBSE Class 10th Board Pattern Test - Science", "NDA Foundation Mock Test - Mathematics"] } },
      { $set: { className: "11th" } }
    );

    console.log(`Updated ${result.modifiedCount} tests to class '11th'.`);

  } catch (err) {
    console.error("Error updating tests:", err);
  } finally {
    await mongoose.disconnect();
  }
}

fixTestClasses();
