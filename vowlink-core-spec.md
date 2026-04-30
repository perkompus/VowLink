# VowLink: Senior iOS-Web Specification

## 1. Project Identity
- **Name:** VowLink
- **Persona:** A high-end, minimalist relationship utility for iPhone users.
- **Aesthetic:** Apple Notes / Analog Stationery.
- **Tone:** Professional, neutral, and supportive.

## 2. Visual Design System (iOS Native Feel)
- **Background:** Pure White (#FFFFFF).
- **Text:** Near-Black (#1A1A1A).
- **Typography:** System Monospace Stack (`ui-monospace, 'SF Mono', SFMono-Regular, monospace`).
- **UI Architecture:**
    - **Borders:** Ultra-thin 0.5px solid #E5E5E5 (mimicking iOS dividers).
    - **Safe Areas:** Adherence to `env(safe-area-inset-top)` for Dynamic Island and `env(safe-area-inset-bottom)` for the home indicator.
    - **Layout:** WhatsApp-style message orientation.

## 3. Message Orientation Logic
- **Me (Right):** Right-aligned. No bubble. Label "Me" in 40% opacity. 
- **Partner (Left):** Left-aligned. No bubble. Label "Partner" in 40% opacity. 
- **VowLink (Center):** Narrow centered block. Light gray background (#F9F9F9). Monospace font. No identifier label.

## 4. Feature Set & State Machine
- **Session Entry:** 
    - Check `localStorage` for user name. If empty, prompt for name (Login).
    - Show two options: [Create Session] or [Join Session].
- **Handshake:**
    - 6-digit numeric PIN for connection.
    - Host generates PIN; Guest enters PIN using numeric-only keypad.
- **Active Chat Modes:**
    - **Solo Mode:** Only 1 user present. Gemini acts as a 'Reflective Journal' (Private venting).
    - **Mediation Mode:** 2 users present. Gemini acts as 'Neutral Mediator' (Resolving conflicts).[cite: 1]
- **Sign Out:** "End Session" wipes `localStorage` and deletes the session/messages from the database.[cite: 1]

## 5. Technical Requirements
- **Framework:** React (Vite) + Tailwind CSS + Framer Motion.
- **Backend:** Supabase (PostgreSQL + Realtime).[cite: 1]
- **Keyboard Handling:** Use `visualViewport` API to prevent the iOS keyboard from hiding the input field.[cite: 1]
- **AI Integration:** Gemini 1.5 Pro via Supabase Edge Functions.[cite: 1]

## 6. Database Schema (SQL)
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pin_code TEXT UNIQUE NOT NULL,
  host_name TEXT NOT NULL,
  guest_name TEXT,
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  role TEXT NOT NULL, 
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);