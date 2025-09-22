import nodemailer from "nodemailer";
import { success } from "zod";

export const sendMail = async(subject,RadioReceiver,body)=>{
    const transporter =  nodemailer.createTransport({
        host: process.env.NODEMAILER_HOST,
        port: process.env.NODEMAILER_PORT,
        secure: false,
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PASSWORD
        }
    })

    const options = {
        from : `"M K Jewellers" <${process.env.NODEMAILER_EMAIL}>`,
        to : RadioReceiver,
        subject:subject,
        html:body
    }

    try{
        await transporter.sendMail(options)
        return {success:true,message:"Email sent successfully"}
    }catch(err){
        return {success:false,message:err.message}
    }
}