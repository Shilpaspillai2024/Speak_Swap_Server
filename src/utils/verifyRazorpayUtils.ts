import crypto from "crypto"




 export default function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
        throw new Error("RAZORPAY_KEY_SECRET is not set in environment variables");
    }
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(orderId + "|" + paymentId);
    const generatedSignature = hmac.digest("hex");
    
    return generatedSignature === signature;
  }