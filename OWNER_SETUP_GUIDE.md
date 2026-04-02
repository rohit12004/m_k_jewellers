# Owner Infrastructure Setup Guide

To ensure you have full ownership and security for **M.K. Jewellers**, please follow these steps to create your own service accounts. Once completed, provide the resulting keys so I can migrate the website data to your accounts.

---

## 1. Supabase (Database Management)
1.  **Sign up**: Visit [supabase.com](https://supabase.com/).
2.  **Create New Project**: 
    - Name: `M_K_Jewellers`
    - **Database Password**: Create a strong password (save it! You will need it).
    - Region: Select `Mumbai (ap-south-1)` for best performance in India.
3.  **Collect API Keys**: Go to **Project Settings > API**. 
    - Copy: `Project URL`
    - Copy: `anon public` key
    - Copy: `service_role secret` key
4.  **Database URL**: Go to **Settings > Database**. Scroll down to **Connection string**. 
    - Select **Transaction Pooler** (Mode: Transaction).
    - Copy the string—it looks like: `postgresql://postgres.[REF]:[PASSWORD]@...:6543/postgres`
    - **Important**: Replace `[PASSWORD]` with the password you created in step 2.

---

## 2. Cloudinary (Image & Video Storage)
1.  **Register**: Visit [cloudinary.com](https://cloudinary.com/).
2.  **Dashboard**: Copy the `Cloud Name`, `API Key`, and `API Secret`.
3.  **Create Upload Preset**: Go to **Settings (Gear Icon) > Upload**. 
    - Scroll down to **Upload presets** and click **Add upload preset**.
    - **Name**: `M.K.Jewellers` (exact spelling).
    - **Signing Mode**: Set to **Unsigned**.
    - Click **Save**.

---

## 3. Google AI (Gemini Chatbot)
1.  Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Click **Create API Key in new project**.
3.  Copy the generated **API Key**. 

---

## 4. Gmail (Order Notifications & OTP)
1.  Log in to your business Gmail account.
2.  Go to **Google Account Settings > Security**.
3.  Turn ON **2-Step Verification**.
4.  Search for **"App Passwords"** in the top search bar. 
    - Select App: `Other (Custom name)` -> Enter `MK Jewellers Website`.
    - Generate and **copy the 16-character code**. (This is the password the website uses to send emails).

---

## 5. Razorpay (Payment Gateway)
1.  Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2.  Go to **Settings > API Keys**.
3.  Click **Generate Key ID and Secret**. 
4.  Copy both (this will be used for live payments).

---

### What's Next?
Once you have these keys, please share them with me. I will then run a migration script that moves all existing product images, categories, and account data into your new "Owner" accounts seamlessly.
