import { response } from "@/lib/helperFunction";
import { zSchema } from "@/lib/zodSchema";
import { createUser, findUserByEmail } from "@/lib/user.service";
import { sendMail } from "@/lib/sendMail";
import { emailVerificationLink } from "@/email/emailVerificationLink";
import { catchError } from "@/lib/helperFunction";
import { SignJWT } from "jose";
import { getBaseUrl } from "@/lib/getBaseUrl";

export async function POST(request) {
    try {
        // 1️⃣ Validate payload
        const validationSchema = zSchema.pick({
            name: true,
            email: true,
            password: true,
        });

        const payload = await request.json();
        const validatedData = validationSchema.safeParse(payload);

        if (!validatedData.success) {
            return response(
                false,
                401,
                "Invalid Data or Missing Data",
                validatedData.error
            );
        }

        const { name, email, password } = validatedData.data;

        // 2️⃣ Check if user already exists
        const checkUser = await findUserByEmail(email); // using service function
        if (checkUser) {
            return response(false, 409, "User Already Exists, Please Login");
        }

        // 3️⃣ Create new user (hashed password handled in service)
        const NewRegistration = await createUser({ name, email, password });

        const secret = new TextEncoder().encode(process.env.SECRET_KEY);

        const token = await new SignJWT({ id: NewRegistration.id })
            .setIssuedAt()
            .setExpirationTime('1h')
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret);

        const mailResponse = await sendMail('EMail Verification request from M K Jewellers',
            email, emailVerificationLink(`${await getBaseUrl()}/auth/verify-email/${token}`))

        if (!mailResponse.success) {
            return response(false, 500, "User created but failed to send email", mailResponse.message);
        }

        // 4️⃣ Return success response
        return response(true, 200, "User Registered Successfully, Please Verify Your Email");


    } catch (error) {
        console.error("Register Error:", error);
        if (error instanceof z.ZodError) {
            return response(false, 400, "Validation Failed", error.errors);
        }
        return catchError(error)
    }
}
