import cron from "node-cron";
import { prisma } from "@/lib/prisma";

// run every minute
cron.schedule("0 * * * *", async () => {
  console.log("⏳ Cron job triggered at", new Date().toISOString());
  try {
    const result = await prisma.oTP.deleteMany({
      where: {
        expiresAt: { lt: new Date() }, // delete expired
      },
    });
    if (result.count > 0) {
      console.log(`🧹 Deleted ${result.count} expired OTP(s)`);
    }
  } catch (error) {
  }
});
