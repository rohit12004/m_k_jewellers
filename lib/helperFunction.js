import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const response = (success, statusCode, message, data={})=>{
    return NextResponse.json({
        success, statusCode, message, data
    })     
}

export const catchError = (error, customMessage)=>{
    //handling duplicate key error
    if(error.code === 11000){
        const keys = Object.keys(error.keyPattern).join(",")
        error.message = `Duplicate fields: ${keys}. These fields value must be unique.`
    }

    let errorObj = {}

    if(process.env.NODE_ENV === 'development'){
        errorObj={
            message:error.message,
            error
        }
    }else{
        errorObj={
            message:error.message || 'internal server error'
        }
    }

    return NextResponse.json({
        success:false,
        statusCode: error.statusCode,
        ...errorObj
    })
}

export const generateOTP = () =>{
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp
}

export const isAuthenticated = async(role)=>{
    try {
        const cookieStore = await cookies();
        // console.log('cookieStore',cookieStore)
        if(!cookieStore.has('access_token')){
            return{
                isAuth:false,
            }
        }

        const access_token = cookieStore.get('access_token');
        // console.log('access_token',access_token)

        const {payload} = await jwtVerify(
            access_token.value,
            new TextEncoder().encode(process.env.SECRET_KEY)
        )

        if(payload.role !== role){
            return {
                isAuth:false,
            }
        }

        return {
            isAuth:true,
            userId: payload.userId,
        }
    } catch (error) {
        return {isAuth:false};
    }
}