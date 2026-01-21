/**
 * Store Knowledge Base for Chatbot
 * 
 * This file contains all store-related information that the chatbot can reference.
 * Each chunk is embedded once on server startup and retrieved via semantic search.
 * 
 * Format:
 * - category: Grouping for organization (not used in search)
 * - title: Brief descriptor (not used in search)
 * - content: The actual information that gets embedded and searched
 * 
 * Tips for adding content:
 * - Keep each chunk focused on ONE topic
 * - Write naturally (the AI understands context)
 * - Include relevant keywords users might ask about
 * - Update this file and restart server to apply changes
 */

export const storeKnowledge = [
    // ==================== STORE DETAILS ====================
    {
        category: "store_details",
        title: "Store Location & Contact Information",
        content: `MK Jewellers is located at Arihant Mall, Main Road, Ratnagiri, Maharashtra, 415612, India.

Contact Information:
- name: Mahavir Jain
- Phone: +91-9881339944
- Email: mkjew@rediffmail.com
- WhatsApp: +91-9881339944

Operating Hours:
- Monday to Sunday: 11:00 AM - 10:00 PM
- Open all days including weekends and most public holidays
- Closed only on major festivals (announced in advance)

We welcome walk-in customers and also accept appointments for personalized consultations. Visit us at Arihant Mall for an exquisite collection of gold, silver, and diamond jewelry.`
    },

    // ==================== POLICIES - Based on Privacy Policy Page ====================
    {
        category: "policies",
        title: "Return & Exchange Policy",
        content: `Return and Exchange Policy at MK Jewellers:

Important: Customized or made-to-order jewellery is NON-RETURNABLE.

Return Conditions:
- Returns or exchanges are subject to inspection
- Items must be unused and in original condition
- Original tags, packaging, and certificate of authenticity must be included
- No scratches, dents, or signs of wear
- Receipt or proof of purchase required

Non-Returnable Items:
- Custom-made or personalized jewelry
- Engraved items
- Earrings (for hygiene reasons)

Refund Process:
- Refunds (if approved) will be processed within 7 working days
- Original payment method will be credited

Exchanges:
- Free exchange for size adjustments
- Exchange for different design subject to price difference and availability

Note: Normal wear & tear, damage, or mishandling is not covered under returns or refunds.`
    },

    {
        category: "policies",
        title: "Shipping & Delivery Policy",
        content: `Shipping and Delivery Information:

Delivery Timeline:
- Delivery timelines are estimated
- Delays due to courier partners, festivals, or unforeseen events may occur

Shipping Process:
- All jewelry is shipped in secure, tamper-proof packaging
- Fully insured during transit
- Signature required on delivery
- Real-time tracking provided via SMS and email

Orders Processing:
- Orders are processed after full payment confirmation
- Custom orders may take additional time

Note: We deliver across India through trusted courier and logistics partners.`
    },

    {
        category: "policies",
        title: "Payment Methods & Security",
        content: `Accepted Payment Methods at MK Jewellers:

Online Payments:
- Credit/Debit Cards (Visa, Mastercard, Amex, RuPay)
- UPI (Google Pay, PhonePe, Paytm, BHIM)
- Net Banking (all major banks)
- Digital Wallets

Payment Requirements:
- Full payment is required before order processing
- For high-value purchases above ₹2 lakhs, PAN card details are mandatory as per government regulations

Payment Security:
- All online transactions are processed through secure third-party payment gateways
- We DO NOT store credit card, debit card, or UPI details
- All transactions are encrypted with SSL
- PCI-DSS compliant payment gateway
- 3D Secure authentication for card payments

Pricing:
- All prices are in INR and inclusive of GST as mentioned
- Prices may change due to gold, silver, or gemstone market fluctuations
- GST: 3% on gold jewelry, 5% on diamond/gemstone jewelry`
    },

    // ==================== SERVICES ====================
    {
        category: "services",
        title: "Custom Jewelry Design Services",
        content: `Custom Jewelry Design at MK Jewellers:

We specialize in creating bespoke jewelry pieces tailored to your vision.

What We Can Customize:
- Engagement rings and wedding bands
- Necklace sets and pendants
- Bracelets and bangles
- Earrings
- Traditional Indian jewelry (mangalsutra, maang tikka, etc.)

Customization Options:
- Choice of metal (gold, silver)
- Gemstone selection (diamonds, emeralds, rubies, sapphires)
- Purity options (18K, 22K gold)
- Engraving and personalization
- Size and weight adjustments

Important Notes:
- Customized / made-to-order jewellery is non-returnable
- Custom orders may take 2-4 weeks depending on complexity
- Contact us for consultation: +91-9881339944 or WhatsApp

We offer both traditional and contemporary designs to suit all tastes.`
    },

    // ==================== PRODUCT INFORMATION ====================
    {
        category: "products",
        title: "Jewelry Collection & Quality",
        content: `What We Offer at MK Jewellers:

Our Collection:
- Gold Jewellery (exquisite gold designs)
- Silver Jewellery (elegant silver pieces)
- Diamond Jewellery (certified diamonds)
- Customized Jewellery (personalized designs)

Quality Assurance:
- Hallmarked Gold Jewellery (certified purity guaranteed)
- BIS Hallmarking for gold purity
- Diamond jewellery comes with certification
- Transparent pricing with accurate weight & fair rates
- Superior craftsmanship

Important Notes:
- Jewellery images are for reference only
- Actual product may vary in color, design, or finish
- Weight may slightly vary due to craftsmanship
- Each design is carefully crafted to suit both traditional and contemporary tastes

Purity & Certification:
- Gold and silver jewellery are Hallmarked where applicable
- Diamond jewellery comes with certification
- Certificates must be preserved by the customer`
    },

    // ==================== JEWELRY CARE & EDUCATION ====================
    {
        category: "education",
        title: "Gold Jewelry Care Instructions",
        content: `How to Care for Your Gold Jewelry:

Daily Care:
- Remove gold jewelry before showering, swimming, or exercising
- Avoid contact with chemicals (perfume, hairspray, cleaning products)
- Put jewelry on AFTER applying makeup and cosmetics
- Remove before sleeping to prevent damage

Cleaning at Home:
- Mix mild dish soap with warm water
- Soak jewelry for 10-15 minutes
- Gently scrub with a soft toothbrush
- Rinse thoroughly and pat dry with soft cloth
- Do NOT use harsh chemicals or abrasive materials

Storage:
- Store each piece separately in soft pouches
- Keep in a cool, dry place away from sunlight
- Use anti-tarnish strips in jewelry box
- Avoid storing in bathroom (moisture can damage)

Warning Signs:
- Loose stones or prongs
- Discoloration or tarnishing
- Bent or broken clasps
- Bring to us immediately for inspection

Note: Normal wear & tear, damage, or mishandling is not covered under returns or refunds.`
    },

    {
        category: "education",
        title: "Understanding Gold Purity & Hallmarking",
        content: `Gold Purity and Hallmarking Explained:

Gold Purity Levels:
- 24K Gold: 99.9% pure gold (soft, used for coins and bars)
- 22K Gold: 91.6% pure gold (traditional Indian jewelry)
- 18K Gold: 75% pure gold (durable, ideal for daily wear)

What is Hallmarking?
- BIS (Bureau of Indian Standards) certification
- Guarantees purity of gold
- Mandatory for all gold jewelry in India
- Look for BIS mark, purity, jeweler's ID, and year of marking

How to Verify Hallmark:
- Check for BIS logo on jewelry
- 6-digit alphanumeric HUID (Hallmark Unique ID)
- Verify on BIS website: www.bis.gov.in
- All MK Jewellers gold comes with BIS hallmarking

Making Charges:
- Charges for craftsmanship and design
- Varies based on intricacy and weight
- Transparent pricing at MK Jewellers
- Detailed invoice provided

GST Information:
- 3% GST on gold jewelry
- 5% GST on diamond/gemstone jewelry
- GST shown separately on invoice`
    },

    // ==================== FAQs ====================
    {
        category: "faq",
        title: "Common Questions About Buying Jewelry",
        content: `Frequently Asked Questions:

Q: What are your store hours?
A: We are open from 11:00 AM to 10:00 PM daily, including weekends. Closed only on major festivals.

Q: Where are you located?
A: Arihant Mall, Main Road, Ratnagiri, Maharashtra, 415612

Q: How can I contact you?
A: Phone/WhatsApp: +91-9881339944, Email: mkjew@rediffmail.com or mkjew1976@gmail.com

Q: Do you provide certificates?
A: Yes, all gold jewelry comes with BIS hallmarking certificate. Diamond jewelry includes certification.

Q: What if the jewelry doesn't fit?
A: Free exchange for size adjustments. Contact us within the return period.

Q: Are there any age restrictions?
A: Users must be 18 years or older to place an order.

Q: What information do you collect?
A: We collect name, email, mobile number, billing & shipping address, order details, and PAN card number (for purchases above ₹2 lakhs as per law).

Q: Is my payment information safe?
A: Yes, all payments are processed through secure third-party gateways. We do NOT store card or UPI details.

Q: Can I cancel my order?
A: We reserve the right to cancel orders due to pricing errors, stock issues, or suspected fraud. Order confirmation does not guarantee acceptance.`
    },

    {
        category: "faq",
        title: "Privacy & Data Protection",
        content: `Privacy and Data Protection at MK Jewellers:

Information We Collect:
- Full Name, Email Address, Mobile Number
- Billing & Shipping Address
- Order & Purchase Details
- PAN card number (for tax compliance on high-value purchases)

How We Use Your Information:
- Process and deliver jewellery orders
- Confirm payments and invoices
- Provide customer support
- Send order updates and notifications
- Improve our website and services
- Prevent fraud and unauthorized transactions

Data Sharing:
- We do NOT sell or rent personal information
- Data may be shared with courier & logistics partners, payment service providers
- Shared with government or legal authorities if required by law

Your Rights:
- Access your personal data
- Request corrections
- Request deletion (subject to legal requirements)

Security:
- We implement appropriate security measures to protect your data
- However, no online platform can guarantee 100% security

Contact for Privacy Concerns:
- Email: mkjew1976@gmail.com
- Phone: 9881339944`
    },

    {
        category: "about",
        title: "About MK Jewellers",
        content: `About MK Jewellers:

Our Story:
Founded with a passion for fine jewellery, MK Jewellers was created to offer designs that blend traditional artistry with modern elegance. What began as a small vision is now loved by customers who value purity, trust, and timeless beauty.

Our Values:
- Trust & Transparency
- Quality over Quantity
- Customer Satisfaction
- Ethical Sourcing

Why Choose Us:
- Trusted jewellery brand
- Superior craftsmanship
- Fair and transparent pricing
- Excellent customer support
- Hallmarked gold jewellery with certified purity
- BIS certification ensuring quality

Our Goal:
To make your jewellery-buying experience safe, memorable, and delightful. Your trust is our greatest achievement.

Visit Our Store:
Experience our exquisite collection in person at Arihant Mall, Ratnagiri. We offer both traditional and contemporary designs to celebrate life's most precious moments.`
    }
];

/**
 * Helper function to get all content as plain text
 * (useful for debugging or manual review)
 */
export function getAllKnowledgeText() {
    return storeKnowledge
        .map(item => `[${item.category}] ${item.title}\n${item.content}`)
        .join('\n\n---\n\n');
}

/**
 * Get knowledge by category
 */
export function getKnowledgeByCategory(category) {
    return storeKnowledge.filter(item => item.category === category);
}
