# OneBox 🗳️

**OneBox** lets you connect multiple Gmail accounts in one place, read emails, and send replies—all from a single, beautiful interface! 🚀

---

## ❤️ Features

- **Unified Inbox ,** **Easy Account Linking ,** **Auto‑Refresh Tokens ,** **Compose & Send** 

---

## 🎓 Why I Built This

During my intern season, I missed important emails because my messages were scattered across multiple accounts. To solve this and related problems, I envisioned a “one‑box” solution—and built OneBox! It’s my way of combining full‑stack Next.js learning with a practical tool for staying organized.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS, Framer Motion  
- **Authentication:** NextAuth.js with Google OAuth (Gmail read & send scopes)  
- **Backend & Database:** Next.js API Routes, MongoDB (Mongoose) for storing linked accounts and tokens  
- **Email Integration:** Google Gmail API via `googleapis` & `google-auth-library`  

---

## 🔧 Getting Started

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-username/onebox.git
   cd onebox
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Setup environment variables**  
   Create a `.env` file in the project root:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<your-random-secret>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   MONGODB_URI=<your-mongodb-connection-string>
   ```

4. **Google Cloud Setup**  
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Select the project and go to **APIs & Services → Credentials**
   - Create OAuth 2.0 Client Credentials
   - Add the following **Authorized Redirect URIs**:
     - `http://localhost:3000/api/auth/callback`
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3000/api/accounts/oauth-callback`
   - Add the following **Authorized JavaScript Origins**:
     - `http://localhost:3000`
   - Under **OAuth consent screen**, add test users you want to allow login
   - Add required scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.send`
     - `openid`, `email`, `profile`

5. **Run the development server**  
   ```bash
   npm run dev
   ```

6. **Open in your browser**  
   Navigate to [http://localhost:3000](http://localhost:3000) and connect your Gmail account!

---

## 📸 Screenshots

![login](https://github.com/user-attachments/assets/fa29f888-f917-478d-8390-417a5854eb07)

![dashboard](https://github.com/user-attachments/assets/fbb6ade1-6809-4ebf-be61-d419481c1a2d)

![compose](https://github.com/user-attachments/assets/a1693875-0072-497b-8543-56043ef05745)

---

## 🙌 Contributing

Contributions are welcome! If you find bugs or have ideas to improve OneBox, please open an issue or submit a pull request. Let’s build this tool together!

---

## 🌟 Future Roadmap

- **Ready‑to‑Use Templates:**
- **Attachment Management:**
- **Advanced Filters & Labels:** 
- **Dark Mode & Themes:** 
- **Calendar & Contacts Integration:**

Got more ideas? Let us know and we’ll build them together! 🚧

---

> **Thank you** for checking out OneBox! I hope it makes your life easier and your workflow smoother. 😊
