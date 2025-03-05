# SECRETS 🔐  

**SECRETS** is a secure web app designed to store and manage personal secrets. Users can add secrets, which are encrypted in the database and revealed only when needed, ensuring privacy and security.  

## 🚀 Live Demo  
Check out the live version here: [secretz.netlify.app](https://secretz.netlify.app)  

## ✨ Features  
- 🔒 **End-to-End Encryption** – Secrets are securely stored in Firestore.  
- 🕵️‍♂️ **Hidden by Default** – Secrets remain encrypted until the user clicks "Reveal."  
- 📂 **Organized Storage** – Secrets are managed efficiently within the app.  
- 🔔 **Shared Secrets** – Secrets can be shared with other secret member.

## 🔜 Upcoming Features  
- 🛑 **Decoy Vault** – A secondary vault to mislead unauthorized access attempts.  
- 🔑 **Two-Factor Authentication (2FA)** – Extra security layer for login.  

## 🛠 Technologies Used  
- **Frontend:** Ionic + Angular  
- **Database:** Firestore (with encryption)  
- **Hosting:** Netlify  

## 📌 Installation  

1. Clone the repository:  
   ```sh
   git clone https://github.com/yourusername/secrets.git
   cd secrets
2. Install Dependencies:
   ```sh
   npm install
3. Configure Firebase
   Create a new Firebase project in Firebase Console.
4. Create Environment Files (src/environments/environment.ts & src/environments/environment.prod.ts)
   - Copy the following to your src/environments/environment.ts
   - Replace it with your Firebase Credentials
   ```sh
   export const environment = {
     production: false,
     firebaseConfig: {
       apiKey: "YOUR_API_KEY_HERE",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID",
      }
    };
3. Run the development Server:
   ```sh
   ionic serve

## 📢 Contributing
Contributions are welcome! Feel free to fork the repo, create a new branch, and submit a pull request.
