# Chatbot Workflow Documentation - M.K. Jewellers

This document provides a detailed breakdown of how the AI Chatbot works, its file structure, and the data flow between different components.

## 🏗 Architecture Overview
The chatbot is built using **LangChain** and **Google Gemini (2.5-flash)**. It uses a "Tool-Calling" (or Agentic) architecture, meaning the AI doesn't just guess answers—it has access to real-time tools to fetch products, check policies, and look up categories.

---

## 📂 File Structure & Responsibilities

### 1. API Layer
*   **[`app/api/chatbot/message/route.js`](file:///d:/WEB%20DEV/m_k_jewellers/app/api/chatbot/message/route.js)**
    *   **Role**: Entry point for all chat requests.
    *   **What it does**: Receives the user message, calls the AI agent, and extracts product data from tool results (like `product_search`) to show product cards in the UI.

### 2. Core Agent Logic
*   **[`lib/langchain/agent/agent.js`](file:///d:/WEB%20DEV/m_k_jewellers/lib/langchain/agent/agent.js)**
    *   **Role**: The "Brain" of the chatbot.
    *   **What it does**: 
        *   Initializes the Gemini model.
        *   Binds the available tools.
        *   Manages the conversation history (memory).
        *   Runs the "ReAct" loop: (User Query → Call Tool → Get Result → Final Answer).

*   **[`lib/langchain/agent/prompts.js`](file:///d:/WEB%20DEV/m_k_jewellers/lib/langchain/agent/prompts.js)**
    *   **Role**: Instructions for the AI.
    *   **What it does**: Defines the personality of the chatbot (Warm, Professional, M.K. Jewellers tone) and provides guidance on when to use specific tools.

### 3. Tools (The "Hands")
Tools allow the AI to interact with your database.
*   **[`lib/langchain/tools/index.js`](file:///d:/WEB%20DEV/m_k_jewellers/lib/langchain/tools/index.js)**: The registry where all tools are collected and exported.
*   **[`product-search.js`](file:///d:/WEB%20DEV/m_k_jewellers/lib/langchain/tools/product-search.js)**: Queries the Prisma database for products by category, subcategory, price, or material. **(Updated for Singularization Robustness)**.
*   **[`knowledge-search.js`](file:///d:/WEB%20DEV/m_k_jewellers/lib/langchain/tools/knowledge-search.js)**: Uses a Vector Store (RAG) to find information about store policies (returns, repairs, care instructions).
*   **[`category-lookup.js`](file:///d:/WEB%20DEV/m_k_jewellers/lib/langchain/tools/category-lookup.js)**: Fetches the list of all active categories and subcategories.
*   **[`product-details.js`](file:///d:/WEB%20DEV/m_k_jewellers/lib/langchain/tools/product-details.js)**: Fetches full details for a specific product ID.

---

## 🔄 The Data Flow (Step-by-Step)

1.  **User Inquiry**: User types *"Show me gold rings under 50k"* in the frontend.
2.  **API Gate**: The frontend sends a POST request to `/api/chatbot/message`.
3.  **Agent Initialization**: The `agent.js` pulls the system prompt and conversation history.
4.  **Tool Selection**: Gemini analyzes the user's intent and decides to call `product_search(category: "gold", subCategory: "ring", maxPrice: 50000)`.
5.  **Robust Normalization**: 
    *   If the AI sends `subCategory: "rings"` (plural), the `product-search.js` tool automatically converts it to `ring` (singular) using the **Singularization Helper**.
6.  **Database Query**: The tool runs a Prisma query against your database.
7.  **Synthesis**: The tool returns the raw product data to the AI.
8.  **Final Answer**: Gemini generates an elegant response: *"I found some beautiful gold rings for you within your budget! Here are a few options..."*
9.  **Formatting**: The `route.js` attaches the real product images and links to the message.
10. **Delivery**: The final package is sent back to the user's screen.

---

## 🛠 Recent Core Improvements
*   **Singular Standardization**: The entire system now prefers singular terms (`Ring` instead of `Rings`) to ensure perfect matches between the AI, the URL slugs, and the Database entries.
*   **API Hardening**: Even if a user visits a legacy plural URL (like `/shop?subcategory=rings`), the public APIs now automatically handle the singularization logic.
