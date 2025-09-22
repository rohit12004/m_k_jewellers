import { catchError, response } from "@/lib/helperFunction"
import { findUserById, updateUserEmailVerifiedStatus } from "@/lib/user.service"
import { jwtVerify } from "jose"

export async function POST(request){
    try{
        const {token} = await request.json()

        if(!token){
            return response(false, 400, "Invalid or Missing Token")
        }

        const secret = new TextEncoder().encode(process.env.SECRET_KEY)
        const decoded = await jwtVerify(token, secret)

        // console.log("the decoded token payload is:",decoded.payload)
        const userId = decoded.payload.id

        const user = await findUserById(userId)

        // console.log("the current user is:",user)

        if(!user){
            return response(false,404,"User not found")
        }
        if(user){
            await updateUserEmailVerifiedStatus(userId)
        }

        return response(true,200,"Email verified successfully")
    }catch(error){
        return catchError(error)
    }
}