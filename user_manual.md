# 📖 M.K. Jewellers — User Manual & Project Documentation

Welcome to the official User Manual for the **M.K. Jewellers** digital ecosystem. This project comprises a high-end E-commerce Web Application, a cross-platform Mobile Application, and a comprehensive Admin Management Suite.

---

## 🌟 1. Project Overview
M.K. Jewellers is a modern digital transformation for a premium jewelry brand. It leverages cutting-edge technologies like **Next.js**, **React Native (Expo)**, and **AI-driven assistance** to provide a seamless shopping experience.

### Key Highlights:
- **Virtual Try-On (AR)**: Try jewelry virtually using your camera or photos.
- **AI Chatbot**: A smart assistant powered by Google Gemini to help discover products.
- **Cross-Platform**: Unified experience across Web and Mobile.
- **Secure Payments**: Integrated with Razorpay for safe transactions.

---

## 🛍️ 2. Customer Features (User Guide)

### 2.1 Account & Security
- **Registration**: Sign up using your email and mobile number.
- **OTP Verification**: Secure login and registration via One-Time Passwords (OTP) sent to your email.
- **Profile Management**: Update your delivery address and personal details in the 'My Account' section.

### 2.2 Browsing the Collection
- **Home Page**: Discover featured products, seasonal collections, and top categories.
- **Smart Search**: Use the search bar to find specific items by name, material, or category.
- **Filtering**: Narrow down your search by Gender (Men/Women), Purity (22K, 24K, 18K), and Price Range.

### 2.3 Virtual Try-On (The "Magic" Mirror) 🔮
*Available on both Web and Mobile.*
1. Open any product detail page.
2. Click the **"Virtual Try-On"** button.
3. **Capture** a live photo from your webcam or **Upload** an existing photo.
4. The jewelry will overlay on your photo. You can:
   - **Drag & Position** the jewelry.
   - **Scale & Rotate** for a perfect fit.
   - **Duplicate** (useful for earrings).
   - **Download** your final look to share with friends.

### 2.4 AI Shopping Assistant 🤖
Our AI Chatbot is available 24/7. You can ask it:
- *"Show me gold rings under ₹50,000."*
- *"What is your return policy?"*
- *"Do you have any necklaces for women in 18K gold?"*
The chatbot will provide direct product links and helpful information.

### 2.5 Shopping Cart & Checkout
- **Add to Cart**: Save items for later.
- **Variant Selection**: Choose the specific weight, size, or purity for your selected piece.
- **Payment**: Checkout securely using Razorpay (Supports UPI, Cards, Net Banking).

---

## 🛠️ 3. Admin Features (Management Guide)

### 3.1 Admin Dashboard
The dashboard provides a bird's-eye view of your business, including recent orders and total products.

### 3.2 Catalog Management
- **Categories**: Create and manage top-level categories (e.g., Rings, Necklaces).
- **Sub-Categories**: Link sub-categories to multiple main categories for flexible navigation.
- **Product Management**:
  - Add new products with detailed descriptions.
  - Upload high-resolution images via the **Media Modal**.
  - Add **Product Variants** (manage different weights, sizes, and purities for the same design).
  - Set specific **Labour Charges**, **GST**, and **Hallmark Charges**.

### 3.3 Media Library
Centralized management for all product images. Powered by Cloudinary, ensuring fast loading times and optimized images for users.

### 3.4 Order Tracking
View and manage customer orders, update delivery status, and track payment confirmations.

---

## 💻 4. Technical Stack (For Faculty Review)

### **Frontend & Backend (Web)**
- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS & Lucide Icons
- **State Management**: Zustand / React Context API

### **Mobile App**
- **Framework**: React Native with Expo
- **Navigation**: Expo Router (File-based routing)
- **Animation**: React Native Reanimated

### **Database & Infrastructure**
- **Database**: MySQL (Relational)
- **ORM**: Prisma (Type-safe database client)
- **Image Hosting**: Cloudinary
- **Email Service**: Resend (for OTPs and Notifications)
- **Payment Gateway**: Razorpay API

### **AI & Advanced Features**
- **LLM**: Google Gemini API (LangChain Framework)
- **AR Component**: Fabric.js (Canvas-based image manipulation)

---

## ❓ 5. Frequently Asked Questions (FAQ)

**Q: How do I verify my email?**
A: Upon registration, a 6-digit OTP is sent to your email. Enter this code on the verification screen to activate your account.

**Q: Can I use Virtual Try-On without a camera?**
A: Yes, you can upload a saved photo from your device to see how the jewelry looks.

**Q: Is the payment safe?**
A: All payments are processed through Razorpay, which uses industry-standard encryption and security protocols.

---

*Generated for M.K. Jewellers Academic Project Submission — 2026*
