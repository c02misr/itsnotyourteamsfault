// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaewNUV7i50S4DYMVgzBLVg2Rc8dJpmLk",
  authDomain: "phi-of-t.firebaseapp.com",
  projectId: "phi-of-t",
  storageBucket: "phi-of-t.appspot.com",
  messagingSenderId: "134964093529",
  appId: "1:134964093529:web:9537a8951d77d4ceac8748"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = firebase.firestore();

// Select the registration form elements
const registerButton = document.getElementById('register-button');
const registerForm = document.getElementById('register-form');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const submitRegisterButton = document.getElementById('submit-register');

// Attach click event listeners to the register button and submit button
registerButton.addEventListener('click', () => {
  registerForm.style.display = 'block';
});
submitRegisterButton.addEventListener('click', registerWithEmailAndPassword);

// Register with email and password function
function registerWithEmailAndPassword() {
  const email = registerEmailInput.value;
  const password = registerPasswordInput.value;
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // User registered successfully
      const user = userCredential.user;
      console.log('User registered:', user);
      registerForm.style.display = 'none';
    })
    .catch((error) => {
      // An error occurred during registration
      console.error('Error registering:', error);
    });
}


// Select the form elements
const signInButton = document.getElementById('sign-in-button');
const signInForm = document.getElementById('sign-in-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitSignInButton = document.getElementById('submit-sign-in');
const phiForm = document.getElementById('phi-form');
const phiValueInput = document.getElementById('phi-value');
const submitPhiButton = document.getElementById('submit-phi');

// Attach click event listeners to the sign-in button and submit button
signInButton.addEventListener('click', () => {
  signInForm.style.display = 'block';
});
submitSignInButton.addEventListener('click', signInWithEmailAndPassword);

// Sign in with email and password function
function signInWithEmailAndPassword() {
  const email = emailInput.value;
  const password = passwordInput.value
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // User signed in successfully
      const user = userCredential.user;
      console.log('User signed in:', user);
      signInForm.style.display = 'none';
    })
    .catch((error) => {
      // An error occurred during sign-in
      console.error('Error signing in:', error);
    });
}

// Check for user state changes
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    console.log('User is signed in:', user);
    signInButton.style.display = 'none';
    phiForm.style.display = 'block';
  } else {
    // User is signed out
    console.log('User is signed out');
    signInButton.style.display = 'block';
    phiForm.style.display = 'none';
  }
});

// Attach a click event listener to the submit button
submitPhiButton.addEventListener('click', savePhiValue);

// Save the Phi value and timestamp to Firestore
async function savePhiValue() {
  const user = firebase.auth().currentUser;

  if (!user) {
    alert('Please sign in to submit Phi value');
    return;
  }

  try {
    const phiValue = parseFloat(phiValueInput.value);
    const timestamp = new Date();
    await firestore.collection('phi-values').add({
      uid: user.uid,
      phi: phiValue,
      timestamp: timestamp,
    });
    console.log('Phi value saved successfully');
    alert('Phi value saved successfully');
  } catch (error) {
    console.error('Error saving Phi value:', error);
    alert('Error saving Phi value');
  }
}
const viewPhiButton = document.getElementById('view-phi-button');
const phiChartElement = document.getElementById('phi-chart');

// Attach a click event listener to the view button
viewPhiButton.addEventListener('click', displayPhiValues);

// Fetch and display the Phi values
async function displayPhiValues() {
  const user = firebase.auth().currentUser;

  if (!user) {
    alert('Please sign in to view Phi values');
    return;
  }

  try {
    const phiValuesSnapshot = await firestore.collection('phi-values')
      .where('uid', '==', user.uid)
      .orderBy('timestamp', 'asc')
      .get();
      
    const phiData = phiValuesSnapshot.docs.map(doc => ({
      phi: doc.data().phi,
      timestamp: doc.data().timestamp.toDate(),
    }));
    
    createChart(phiData);
  } catch (error) {
    console.error('Error fetching Phi values:', error);
    alert('Error fetching Phi values');
  }
}

function createChart(phiData) {
  const ctx = phiChartElement.getContext('2d');
  
  const labels = phiData.map(data => data.timestamp);
  const dataPoints = phiData.map(data => data.phi);
  
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Phi(t)',
        data: dataPoints,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      }]
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
          }
        },
        y: {
          min: -20,
          max: 20,
        }
      }
    }
  });

  phiChartElement.style.display = 'block';
}
























