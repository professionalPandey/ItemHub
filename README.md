# Item hub

## Description

This is a React Native app built using Expo. The app includes user authentication (login and signup), a home screen with a user list, and a detailed user screen.

## Features

- User authentication: Login and Signup functionality.
- Firebase integration for user data management.
- Automatic logout to encourage single device usage.
- A home screen that displays a list of users.
- A detailed screen for viewing user information.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-repository.git
   ```
2. Navigate to the project directory:
   ```bash
   cd your-repository
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the project:
   ```bash
   npm start
   ```

## Firebase Configuration

Ensure you have a Firebase project set up. Replace the Firebase configuration in your code with the following:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbdwNS8uqzmSPpwA9vpWsAuEnwDs53KI4",
  authDomain: "itemhub.firebaseapp.com",
  databaseURL:
    "https://itemhub-687d8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "itemhub-687d8",
  storageBucket: "itemhub-687d8.appspot.com",
  messagingSenderId: "601748750117",
  appId:
    "1:601748750117:web:BM4cMxd_Oqomv5Fy3Se5F8VlWsy0pvNusp-pd6C78w0xB4ZpdmY7yXF_6XvAg2KQg-dg8Z88JOU-WH6DFSFexWY",
};
```

## App Flow

1. **Login Screen**:  
   Users enter their email and password to log in. If they don’t have an account, they can navigate to the signup screen.

2. **Signup Screen**:  
   New users can create an account by providing their email, password, and any other required information.

3. **Home Screen**:  
   Once logged in, users are navigated to the home screen, which displays a list of users fetched from the Firebase database.

4. **User Detail Screen**:  
   Tapping on a user in the list navigates to the detail screen, where more information about the user is displayed.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).