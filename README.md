# PantryPal.ai

## Description
PantryPal.ai is your personal kitchen assistant, designed to help you create delicious recipes based on the ingredients you have on hand. Whether you're looking to minimize food waste, get creative in the kitchen, or simply find meal ideas quickly, PantryPal.ai makes it easy to cook smarter and tastier meals.

---

## Key Features
- Spoonacular API Integration: Generates recipes and detailed information based on user-provided ingredients.  
- Customizable Settings:  
  - Set the maximum number of non-inputted ingredients for API calls.  
  - Limit the number of recipes generated per query.  
- Gemini API Integration:  
  - Enables ingredient input via image upload.  
  - Adjusts recipes and ingredients based on user-defined constraints  
- User Accounts: Create accounts manually or sign in with Google  
- Shopping List: Add non-inputted ingredients required for recipes to a personal shopping list  
- Recipe History: Access previously generated recipes  
- Recipe Favorites: Favorite and rank recipes for future reference  

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
npm start dev
```

The app will be visible at [http://localhost:3000](http://localhost:3000), or another port as specified, in your browser

---
## Project Contributors:
- Aditya Rao (adityar-123)
- Arsh Koneru-Ansari (ArshKA)
- Krish Kumar (kumarkrishh)
- Andy Xu (xuandy05)
- Anshul Chennavaram ()
