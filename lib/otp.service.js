import prisma from "../lib/prisma.js";

export const deleteOTPByEmail = async (email) => {
  try {
    const result = await prisma.oTP.deleteMany({
      where: { email },
    });

    if (result.count === 0) {
      return { success: false, message: "No OTP found for this email" };
    }

    return { success: true, message: "OTP deleted successfully" };
  } catch (error) {
    console.error("Error deleting OTP:", error);
    return { success: false, message: "Failed to delete OTP" };
  }
};



export const saveOTP = async (email, generatedotp) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return await prisma.oTP.create({
    data: {
      email,
      otp: generatedotp,
      expiresAt,
    },
  });
};

export const verifyOTP = async (email, generatedotp) => {
  const record = await prisma.oTP.findFirst({
    where: {
      email,
      otp: generatedotp,
      expiresAt: { gt: new Date() }, // must not be expired
    },
  });

  if (!record) {
    return { success: false, message: "Invalid or expired OTP" };
  }

  return { success: true, data: record }
};


