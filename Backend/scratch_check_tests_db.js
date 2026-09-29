import mongoose from 'mongoose';

const mongoUrl = "mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0";

async function check() {
  await mongoose.connect(mongoUrl);
  const tests = await mongoose.connection.db.collection('tests').find({}).toArray();
  console.log("TESTS IN DB:", JSON.stringify(tests, null, 2));
  
  const users = await mongoose.connection.db.collection('users').find({ role: 'student' }).toArray();
  console.log("STUDENT CLASSES:", users.map(u => ({ email: u.email, currentClass: u.currentClass, className: u.className })));

  await mongoose.disconnect();
}
check().catch(console.error);
