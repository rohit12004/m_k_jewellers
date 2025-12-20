import { catchError, response } from "@/lib/helperFunction"
import { findUserById, updateUserEmailVerifiedStatus } from "@/lib/user.service"
import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"

export async function POST(request){
    try{
        const {token} = await request.json()

        if(!token){
            return response(false, 400, "Invalid or Missing Token")
        }

        const secret = new TextEncoder().encode(process.env.SECRET_KEY)
        const decoded = await jwtVerify(token, secret)

        const userId = decoded.payload.id

        const user = await findUserById(userId)

        if(!user){
            return response(false,404,"User not found")
        }

        // Update email verification status
        await updateUserEmailVerifiedStatus(userId)

        // Create session token and auto-login the user
        const loggedInUserData = {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            avatarUrl: user.avatarUrl,
        }

        const sessionToken = await new SignJWT(loggedInUserData)
            .setIssuedAt()
            .setExpirationTime('24h')
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret)

        const cookieStore = await cookies()
        cookieStore.set({
            name: "access_token",
            value: sessionToken,
            httpOnly: process.env.NODE_ENV === 'production',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })

        return response(true, 200, "Email verified successfully! You are now logged in.", loggedInUserData)
    }catch(error){
        return catchError(error)
    }
}