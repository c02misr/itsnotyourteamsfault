document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
        apiKey: "AIzaSyANNuJlkFPlcrtH8FJ4MXWepLPehboENMY",
        authDomain: "itsnotyourteamsfault.firebaseapp.com",
        projectId: "itsnotyourteamsfault",
        storageBucket: "itsnotyourteamsfault.appspot.com",
        messagingSenderId: "597728884174",
        appId: "1:597728884174:web:7c9a47d1a051339b4ca79f"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const firestore = firebase.firestore();

    // Authentication and form elements
    const signInButton = document.getElementById('sign-in-button');
    const signInForm = document.getElementById('sign-in-form');
    const registerButton = document.getElementById('register-button');
    const registerForm = document.getElementById('register-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitSignInButton = document.getElementById('submit-sign-in');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const submitRegisterButton = document.getElementById('submit-register');
    const saveGameDataButton = document.getElementById('save-game-data');

    // Event listeners for UI elements
    signInButton.addEventListener('click', () => {
        signInForm.style.display = 'block';
    });

    registerButton.addEventListener('click', () => {
        registerForm.style.display = 'block';
    });

    submitSignInButton.addEventListener('click', signInWithEmailAndPassword);
    submitRegisterButton.addEventListener('click', registerWithEmailAndPassword);
    saveGameDataButton.addEventListener('click', saveGameData);

    function signInWithEmailAndPassword() {
        const email = emailInput.value;
        const password = passwordInput.value;
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('User signed in:', userCredential.user);
                signInForm.style.display = 'none';
            })
            .catch((error) => {
                console.error('Error signing in:', error);
                alert('Sign in failed: ' + error.message);
            });
    }

    function registerWithEmailAndPassword() {
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('User registered:', userCredential.user);
                registerForm.style.display = 'none';
                alert('Registration successful!');
            })
            .catch((error) => {
                console.error('Error registering:', error);
                alert('Failed to register: ' + error.message);
            });
    }

    function saveGameData() {
        const user = firebase.auth().currentUser;
        if (!user) {
            alert('Please sign in to save game data');
            return;
        }

        const gameData = {
            uid: user.uid,
            exercised: getValidatedInput('exercised', -20, 20),
            meditated: document.getElementById('meditated').checked,
            read: getValidatedInput('read', -20, 20),
            write: getValidatedInput('write', -20, 20),
            sleep: getValidatedInput('sleep', -20, 20),
            diet: getValidatedInput('diet', -20, 20),
            caffeination: getValidatedInput('caffeination', -20, 20),
            timeSinceLastMeal: parseFloat(document.getElementById('time-since-meal').value),
            nerveBefore: getValidatedInput('nerve-before', -20, 20),
            grassLevel: getValidatedInput('grass-level', -20, 20),
            brainFogLevel: getValidatedInput('brain-fog-level', -20, 20),
            jadeLevel: getValidatedInput('jade-level', -20, 20),
            buildLevel: getValidatedInput('build-level', -20, 20),
            confidence: getValidatedInput('confidence-level', -20, 20),
            Ranked: document.getElementById('ranked').checked,
            performance: getValidatedInput('performance', -20, 20),
            winLoss: document.getElementById('win-loss').checked,
            gameNotes: document.getElementById('game-notes').value,
            timestamp: new Date()
        };

        firestore.collection('game-data').add(gameData)
            .then(() => {
                alert('Game data saved successfully');
                // Optionally reset forms here or close the game data form
            })
            .catch((error) => {
                console.error('Error saving game data:', error);
                alert('Error saving game data: ' + error.message);
            });
    }

    function getValidatedInput(elementId, min, max) {
        const value = parseInt(document.getElementById(elementId).value, 10);
        if (!isNaN(value) && value >= min && value <= max) {
            return value;
        }
        alert(`${elementId} must be between ${min} and ${max}.`);
        return null;  // Returning null to indicate invalid input
    }

    function showLoader(display) {
        document.getElementById('loader').style.display = display ? 'block' : 'none';
    }
    
});
