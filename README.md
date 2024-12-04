# PantryPal

## Description
PantryPal is your personal kitchen assistant, designed to help you create delicious recipes based on the ingredients you have on hand. Whether you're looking to minimize food waste, get creative in the kitchen, or simply find meal ideas quickly, PantryPal makes it easy to cook smarter and tastier meals.

---

## Key Features
- Spoonacular API Integration: Generates recipes and detailed information based on user-provided ingredients.  
- Customizable Settings:  
  - Set the maximum number of non-inputted ingredients for API calls.  
  - Limit the number of recipes generated per query.  
- Open AI API Integration:  
  - Enables ingredient input via image upload.  
  - Edit recipe ingredients to match user constraints  
- View additional information such as nutritional information, prep time, serving size, and diets 
- Create accounts manually or sign in with Google
  - Favorite recipes and associated information for future reference  

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
NEXT_PUBLIC_SPOONACULAR_API_KEY_1=
NEXT_PUBLIC_SPOONACULAR_API_KEY_2=
NEXT_PUBLIC_SPOONACULAR_API_KEY_3=
NEXT_PUBLIC_GEMINI_API_KEY=
NEXT_PUBLIC_OPENAI_API_KEY=
NEXT_PUBLIC_EMAIL_JS_SERVICE_ID=
NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID=
NEXT_PUBLIC_EMAIL_JS_USER_ID=
```

### To run the Frontend (React):

```bash
npm install
npm run dev
```

The app will be visible at [http://localhost:3000](http://localhost:3000), or another port as specified, in your browser

### Important Note: 
- Make sure that you are on eduroam WiFi for full functionality (as opposed to UCLA_WEB or UCLA_WIFI)

---
## Project Contributors:
- Krish Kumar (kumarkrishh)
- Aditya Rao (adityar-123)
- Arsh Koneru-Ansari (ArshKA)
- Andy Xu (xuandy05)
- Anshul Chennavaram (anshulkc)
