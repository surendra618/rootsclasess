import Razorpay from "razorpay";

let razorpayInstance = null;

try {
  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_live_TbpL4le4mBM46T";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "jSE9vzZKj8q5LeoidYYaXOzX";

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
} catch (err) {
  console.warn("⚠️ Razorpay init warning:", err.message);
}

const razorpay = razorpayInstance || {
  orders: {
    create: async () => {
      throw new Error("Razorpay credentials not initialized");
    }
  }
};

export default razorpay;