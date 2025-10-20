import { catchError, response } from "@/lib/helperFunction";
import { cookies } from "next/headers";

export async function POST(request){
    try {
        const cookieStore = await cookies()
        cookieStore.delete('access_token')
        return response(true, 200, "Logout Successfull.")
    } catch (error) {
        catchError(error)
    }
}