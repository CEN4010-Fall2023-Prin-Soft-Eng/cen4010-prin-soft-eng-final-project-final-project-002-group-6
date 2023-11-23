// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js"; // Import the Firestore module

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD26xC-L3bPhSRsGe2vnO62qawCCm5A-yA",
    authDomain: "cinemate-4c026.firebaseapp.com",
    databaseURL: "https://cinemate-4c026-default-rtdb.firebaseio.com",
    projectId: "cinemate-4c026",
    storageBucket: "cinemate-4c026.appspot.com",
    messagingSenderId: "86589565365",
    appId: "1:86589565365:web:fa3da93562a4d3f5ee11fc",
    measurementId: "G-3KJKEDEGJ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Get Auth instance
const auth = getAuth();

// Explicitly assign the toggleMenu function to the global object
window.toggleMenu = function() {
    var dropdownMenu = document.getElementById("myDropdown");
    dropdownMenu.style.display = (dropdownMenu.style.display === "block") ? "none" : "block";
}
  
  // Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.menu-toggle')) {
      var dropdowns = document.getElementsByClassName("dropdown-menu");
      for (var i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.style.display === 'block') {
          openDropdown.style.display = 'none';
        }
      }
    }
};
  

// Function to display error messages
function displayError(message, targetElementId) {
    const errorElement = document.getElementById(targetElementId);
    if (errorElement) {
        errorElement.innerHTML = message;
    }
}

/// Function to handle user login
function loginUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const generalErrorMessage = document.getElementById('generalErrorMessage');

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Handle successful sign-in
            console.log('User signed in:', user);

            // Fetch additional user details from Firestore
            fetchUserDetails(user.uid);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            
            // Display error message
            generalErrorMessage.textContent = 'Invalid login credentials. Please try again.';
            console.error('Login error:', errorCode, errorMessage);
        });
}

// Function to fetch additional user details from Firestore
function fetchUserDetails(uid) {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', uid);

    // Clear previous error messages
    displayError('', 'generalErrorMessage');

    getDoc(userDocRef)
        .then((docSnapshot) => {
            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                const firstName = userData.firstName;
                // Redirect to the homepage with the welcome message
                redirectToHomepage(`Welcome back, ${firstName}! Successfully logged in!`);
            } else {
                console.error('User document does not exist in Firestore');
                // Display the error message to the user
                displayError('User not found', 'generalErrorMessage');
            }
        })
        .catch((error) => {
            console.error('Error fetching user details from Firestore:', error.message);
            // Display the error message to the user
            displayError(error.message, 'generalErrorMessage');
        });
}

// Function to handle user sign-up
function signUpUser() {
    const signupFields = document.getElementById('signupFields');
    const submitSignupButton = document.getElementById('submitSignup');
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');

    // Hide Login and Sign Up buttons
    loginButton.style.display = 'none';
    signupButton.style.display = 'none';

    // Toggle visibility of additional fields and Submit button
    signupFields.style.display = 'block';
    submitSignupButton.style.display = 'block';
}

// Function to handle submission of sign-up details
function submitSignup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Clear previous error messages
    displayError('', 'generalErrorMessage');
    displayError('', 'passwordMismatchMessage');

    // Check if passwords match
    if (password !== confirmPassword) {
        // Display the error message to the user
        displayError("Passwords do not match", 'passwordMismatchMessage');
        return;
    }

    // Create user with additional details
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Use the user property of UserCredential
            const user = userCredential.user;

            // Log user details for debugging
            console.log('User object:', user);
            console.log('User display name:', user.displayName);

            // Save additional user details to Firestore
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            setDoc(userDocRef, {
                firstName: firstName,
                lastName: lastName,
                email: email
            });

            // Redirect to the homepage after updating the profile
            redirectToHomepage(`Welcome, ${firstName}! Account successfully created!`);
        })
        .catch((error) => {
            console.error("Error signing up:", error.message);
            // Display the error message to the user
            displayError(error.message, 'generalErrorMessage');
        });
}

// Function to redirect to the homepage with a success message
function redirectToHomepage(message) {
    // Display a success message on the homepage
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = `<p>${message}</p>`;

    // Delay the redirection for 1000 milliseconds (1 second)
    setTimeout(() => {
        // Redirect to the homepage
        window.location.href = 'index.html';
    }, 1000);
}

// Function to fetch and display user details on the account page
function displayUserDetails() {
    const user = auth.currentUser;

    if (user) {
        const emailElement = document.getElementById('email');
        const firstNameElement = document.getElementById('firstName');
        const lastNameElement = document.getElementById('lastName');

        if (emailElement && firstNameElement && lastNameElement) {
            emailElement.textContent = user.email;
            
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);

            getDoc(userDocRef)
                .then((docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const userData = docSnapshot.data();
                        const firstName = userData.firstName;
                        const lastName = userData.lastName;

                        firstNameElement.textContent = `First Name: ${firstName}`;
                        lastNameElement.textContent = `Last Name: ${lastName}`;
                    } else {
                        console.error('User document does not exist in Firestore');
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user details from Firestore:', error.message);
                });
        }
    }
}

// Function to log out the user
function logoutUser() {
    auth.signOut().then(() => {
        // Redirect to the login page after logging out
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Error logging out:', error.message);
    });
}

// Function to handle changes in authentication state
function handleAuthStateChange(user) {
    const logoutButton = document.getElementById('logoutButton');
    const loginRedirectButton = document.getElementById('loginRedirectButton');

    if (user) {
        // User is signed in
        console.log('User is signed in:', user);

        // Show Log Out button, hide Log In button
        if (logoutButton) logoutButton.style.display = 'block';
        if (loginRedirectButton) loginRedirectButton.style.display = 'none';

        // Fetch and display user details
        displayUserDetails();
    } else {
        // User is signed out
        console.log('User is signed out');

        // Show Log In button, hide Log Out button
        if (logoutButton) logoutButton.style.display = 'none';
        if (loginRedirectButton) loginRedirectButton.style.display = 'block';
    }
}


// Attach event listeners
document.addEventListener('DOMContentLoaded', function () {
    console.log(document.getElementById('loginButton')); // Log the element
    console.log(document.getElementById('signupButton')); // Log the element
    console.log(document.getElementById('submitSignup')); // Log the element

    // document.getElementById('loginButton').addEventListener('click', loginUser);
    // document.getElementById('signupButton').addEventListener('click', signUpUser);
    // document.getElementById('submitSignup').addEventListener('click', submitSignup);

    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    const submitSignupButton = document.getElementById('submitSignup');
    const logoutButton = document.getElementById('logoutButton');
    const loginRedirectButton = document.getElementById('loginRedirectButton');

    if (loginButton) {
        loginButton.addEventListener('click', loginUser);
    }

    if (signupButton) {
        signupButton.addEventListener('click', signUpUser);
    }

    if (submitSignupButton) {
        submitSignupButton.addEventListener('click', submitSignup);
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', logoutUser);
    }
    if (loginRedirectButton) {
        loginRedirectButton.addEventListener('click', redirectToLogin);
    }

    // Set up an observer for changes in authentication state
    auth.onAuthStateChanged(handleAuthStateChange);

    // Call the displayUserDetails function to fetch and display user details on the account page
    displayUserDetails();
});

// Function to redirect to the login page
function redirectToLogin() {
    window.location.href = 'login.html';
}