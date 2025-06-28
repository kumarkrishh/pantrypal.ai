# PantryPal ([**Live Website**](https://pantrypal-ai-git-main-krishkumars-projects.vercel.app/))

## Overview
PantryPal is your personal kitchen assistant, designed to help you create delicious recipes based on the ingredients you have on hand. Whether you're looking to minimize food waste, get creative in the kitchen, or simply find meal ideas quickly, PantryPal makes it easy to cook smarter and tastier meals.

---

## Core Functionality
- Spoonacular API Integration: Generates recipes and detailed information based on user-provided ingredients.  
  - Limit the number of recipes generated per query
  - View additional information such as nutritional information, prep time, serving size, and diets
  - Create accounts manually or sign in with Google
  - Favorite recipes and associated information for future reference

## Additional Features
- Gemini API Integration:  
  - Input ingredients via image upload
- Social Features:
  - Share recipes with family and friends via various platforms
  - Contact PantryPal's developers for feedback, comments, and bug reports

---

## Running the Application

### Clone the Repository:

```bash
git clone https://github.com/kumarkrishh/pantrypal.ai
cd pantrypal.ai
```

### Create a local .env file with the following:

```python
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
MONGODB_URI=
NEXT_PUBLIC_SPOONACULAR_API_KEY=
NEXT_PUBLIC_GEMINI_API_KEY=
```

### To run the Frontend (React):

```bash
npm install
npm run dev
```

The app will be visible at [http://localhost:3000](http://localhost:3000), or another port as specified, in your browser.

### Important Note:
- Make sure that you are on "eduroam" WiFi for full functionality (as opposed to "UCLA_WEB" or "UCLA_WIFI").

---

# PantryPal API Keys Setup Guide

---

### 1. Google OAuth Credentials

**Variables:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

**Steps:**
1. **Create a Google Cloud Project:**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Click **New Project**, name it (e.g., `PantryPal`), and create.

2. **Set Up OAuth Consent Screen:**
   - Navigate to **APIs & Services > OAuth consent screen**.
   - Select **External**, fill in required details, and save.

3. **Create OAuth Client ID:**
   - Go to **APIs & Services > Credentials**.
   - Click **Create Credentials > OAuth client ID**.
   - Choose **Web application**, set authorized origins (`http://localhost:3000`), and redirect URI (`http://localhost:3000/api/auth/callback/google`).
   - Save and copy the **Client ID** and **Client Secret**.

---

### 2. NextAuth Configuration

**Variables:**
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

**Steps:**
1. **Set `NEXTAUTH_URL`:**
   - Use `http://localhost:3000` for local development.

2. **Generate `NEXTAUTH_SECRET`:**
   - Run the following command in your terminal:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Copy the generated string.

---

### 3. MongoDB URI

**Variable:**
- `MONGODB_URI`

**Steps:**
1. **Sign Up for MongoDB Atlas:**
   - Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

2. **Create a Cluster:**
   - Choose a free tier (M0) and deploy your cluster.

3. **Set Up Database User & Network Access:**
   - Create a database user with a password.
   - Whitelist your IP address or use `0.0.0.0/0` for all (not recommended for production).

4. **Get Connection String:**
   - Navigate to **Clusters > Connect > Connect your application**.
   - Copy the connection string and replace `<password>` with your user's password.

---

### 4. Spoonacular API Keys

**Variables:**
- `NEXT_PUBLIC_SPOONACULAR_API_KEY_1`
- `NEXT_PUBLIC_SPOONACULAR_API_KEY_2`
- `NEXT_PUBLIC_SPOONACULAR_API_KEY_3`

**Steps:**
1. **Sign Up:**
   - Register at the [Spoonacular API](https://spoonacular.com/food-api).

2. **Subscribe to a Plan:**
   - Choose a plan based on your needs.

3. **Obtain API Keys:**
   - Access your dashboard to find and generate multiple API keys.

---

### 5. Gemini API Key

**Variable:**
- `NEXT_PUBLIC_GEMINI_API_KEY`

**Steps:**
1. **Create a Gemini Account:**
   - Sign up at [Gemini](https://www.gemini.com/).

2. **Generate API Key:**
   - Go to **Settings > API**.
   - Create a new API key with necessary permissions.
   - Copy the **API Key**.

*Note: Ensure this refers to the correct Gemini service you intend to use.*

---

### 6. OpenAI API Key

**Variable:**
- `NEXT_PUBLIC_OPENAI_API_KEY`

**Steps:**
1. **Sign Up:**
   - Register at [OpenAI](https://platform.openai.com/signup/).

2. **Generate API Key:**
   - Navigate to [API Keys](https://platform.openai.com/account/api-keys).
   - Click **Create new secret key** and copy it.

---

### 7. EmailJS Configuration

**Variables:**
- `NEXT_PUBLIC_EMAIL_JS_SERVICE_ID`
- `NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID`
- `NEXT_PUBLIC_EMAIL_JS_USER_ID`

**Steps:**
1. **Sign Up:**
   - Create an account at [EmailJS](https://www.emailjs.com/).

2. **Add Email Service:**
   - Go to **Email Services** and add your email provider.

3. **Create Email Template:**
   - Design and save a template to get the **Template ID**.

4. **Get User ID:**
   - Find your **User ID** under **Account > API Keys**.

---

## Project Contributors:
- Krish Kumar (kumarkrishh)
- Aditya Rao (adityar-123)
- Arsh Koneru-Ansari (ArshKA)
- Andy Xu (xuandy05)
- Anshul Chennavaram (anshulkc)
