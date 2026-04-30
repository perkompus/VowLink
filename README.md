# VowLink: AI-Mediated Conflict Resolution

**VowLink** is a real-time web application designed to help couples navigate disagreements through AI-assisted communication. By leveraging **Gemini 1.5 Pro**, the platform acts as a neutral third-party mediator that balances emotional validation with logical conflict resolution.

---

## 🚀 The Handshake
VowLink eliminates the friction of account creation. 
* **Host:** Generates a unique 6-digit session PIN.
* **Partner:** Joins the session using the code.
* **Result:** A secure, ephemeral environment for honest communication.

## 🧠 The Mediation Engine
Unlike standard LLM chats, VowLink uses a **Dual-Framework Approach**:
1.  **Emotional Intelligence (EQ):** Identifies underlying hurt, attachment styles, and core needs using Non-Violent Communication (NVC) principles.
2.  **Logical Analysis (IQ):** Detects circular arguments, factual inconsistencies, and suggests actionable compromises.

## ✨ Key Features
* **Real-Time Synchronization:** Powered by Supabase for instantaneous message delivery.
* **Context-Aware Mediation:** Gemini 1.5 Pro maintains the entire history of the session to ensure resolution, not just reaction.
* **Secure & Private:** Ephemeral sessions with Row-Level Security (RLS).

## 🛠️ Tech Stack
* **Frontend:** React 19 + Tailwind CSS
* **Backend:** Supabase (Database, Auth, Realtime)
* **AI Engine:** Google Gemini 1.5 Pro 

## 📦 Getting Started

1. **Clone & Install:** `npm install`
2. **Setup Env:** Create `.env` with your Supabase and Gemini keys.
3. **Database:** Run the SQL provided in the `docs` to set up your `sessions` and `messages` tables.
4. **Run:** `npm run dev`
