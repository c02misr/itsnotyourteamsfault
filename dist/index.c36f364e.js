document.addEventListener("DOMContentLoaded", ()=>{
    let phiChart;
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
    const registerButton = document.getElementById("register-button");
    const registerForm = document.getElementById("register-form");
    const registerEmailInput = document.getElementById("register-email");
    const registerPasswordInput = document.getElementById("register-password");
    const submitRegisterButton = document.getElementById("submit-register");
    // Attach click event listeners to the register button and submit button
    registerButton.addEventListener("click", ()=>{
        registerForm.style.display = "block";
    });
    submitRegisterButton.addEventListener("click", registerWithEmailAndPassword);
    // Existing event listeners for sign-in, registration, etc.
    const backButton = document.getElementById("back-button");
    backButton.style.display = "none"; // Hide the "Back" button initially
    backButton.addEventListener("click", ()=>{
        document.getElementById("phi-chart-container").style.display = "none";
        document.getElementById("app").style.display = "block";
        backButton.style.display = "none";
    });
    const viewPhiButton = document.getElementById("view-phi-button");
    viewPhiButton.addEventListener("click", ()=>{
        document.getElementById("app").style.display = "none";
        document.getElementById("phi-chart-container").style.display = "block";
        backButton.style.display = "block"; // Ensure this line is here to show the button
        displayPhiValues(); // Make sure this function fetches and displays the graph
    });
    // Register with email and password function
    function registerWithEmailAndPassword() {
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        firebase.auth().createUserWithEmailAndPassword(email, password).then((userCredential)=>{
            // User registered successfully
            const user = userCredential.user;
            console.log("User registered:", user);
            registerForm.style.display = "none";
        }).catch((error)=>{
            // An error occurred during registration
            console.error("Error registering:", error);
        });
    }
    async function fetchAndDisplayAveragePhi() {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.log("User not signed in");
            return;
        }
        try {
            const phiValuesSnapshot = await firestore.collection("phi-values").where("uid", "==", user.uid).get();
            let totalPhi = 0;
            let count = 0;
            phiValuesSnapshot.forEach((doc)=>{
                const phiValue = parseFloat(doc.data().phi); // Convert phi value to a number
                if (!isNaN(phiValue)) {
                    totalPhi += phiValue;
                    count++;
                } else console.error("Invalid phi value encountered:", doc.data().phi);
            });
            // Debugging statement to verify totalPhi and count
            console.log(`Total Phi: ${totalPhi}, Count: ${count}`);
            const averagePhi = count > 0 ? (totalPhi / count).toFixed(2) : "No data";
            document.getElementById("average-phi").innerText = `Your average Phi is ${averagePhi}`;
        } catch (error) {
            console.error("Error fetching Phi values:", error);
        }
    }
    // Select the form elements
    const signInButton = document.getElementById("sign-in-button");
    const signInForm = document.getElementById("sign-in-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const submitSignInButton = document.getElementById("submit-sign-in");
    const phiForm = document.getElementById("phi-form");
    const phiValueInput = document.getElementById("phi-value");
    const submitPhiButton = document.getElementById("submit-phi");
    // Attach click event listeners to the sign-in button and submit button
    signInButton.addEventListener("click", ()=>{
        signInForm.style.display = "block";
    });
    submitSignInButton.addEventListener("click", signInWithEmailAndPassword);
    // Sign in with email and password function
    function signInWithEmailAndPassword() {
        const email = emailInput.value;
        const password = passwordInput.value;
        firebase.auth().signInWithEmailAndPassword(email, password).then((userCredential)=>{
            // User signed in successfully
            const user = userCredential.user;
            console.log("User signed in:", user);
            signInForm.style.display = "none";
        }).catch((error)=>{
            // An error occurred during sign-in
            console.error("Error signing in:", error);
        });
    }
    // Check for user state changes
    firebase.auth().onAuthStateChanged((user)=>{
        if (user) {
            // User is signed in
            console.log("User is signed in:", user);
            signInButton.style.display = "none";
            phiForm.style.display = "block";
            fetchAndDisplayAveragePhi();
        } else {
            // User is signed out
            console.log("User is signed out");
            signInButton.style.display = "block";
            phiForm.style.display = "none";
        }
        document.getElementById("app").style.display = "block";
    });
    // Attach a click event listener to the submit button
    submitPhiButton.addEventListener("click", savePhiValue);
    // Save the Phi value and timestamp to Firestore
    async function savePhiValue() {
        const user = firebase.auth().currentUser;
        if (!user) {
            alert("Please sign in to submit Phi value");
            return;
        }
        try {
            const phiValue = parseFloat(phiValueInput.value);
            const timestamp = new Date();
            await firestore.collection("phi-values").add({
                uid: user.uid,
                phi: phiValue,
                timestamp: timestamp
            });
            console.log("Phi value saved successfully");
            alert("Phi value saved successfully");
        } catch (error) {
            console.error("Error saving Phi value:", error);
            alert("Error saving Phi value");
        }
    }
    const phiChartElement = document.getElementById("phi-chart");
    // Fetch and display the Phi values
    async function displayPhiValues(days = 7) {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.log("User not signed in");
            return;
        }
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days); // Calculate the start date based on the selected timescale
        let query = firestore.collection("phi-values").where("uid", "==", user.uid).orderBy("timestamp", "asc");
        // Adjust the query based on the timescale
        if (days > 0) query = query.where("timestamp", ">=", startDate);
         // If days = 0, it means "All Time", so no additional query constraint is needed
        try {
            const phiValuesSnapshot = await query.get();
            const phiData = phiValuesSnapshot.docs.map((doc)=>({
                    phi: doc.data().phi,
                    timestamp: doc.data().timestamp.toDate()
                }));
            createChart(phiData); // Call the function to create/update the chart with the fetched data
        } catch (error) {
            console.error("Error fetching Phi values:", error);
        }
    }
    function createChart(phiData) {
        console.log("createChart was called");
        const ctx = phiChartElement.getContext("2d");
        if (phiChart) phiChart.destroy();
        const labels = phiData.map((data)=>data.timestamp);
        const dataPoints = phiData.map((data)=>data.phi);
        // In a non-modular environment, you don't need to manually register the components
        // as they are already registered when you include Chart.js via a script tag
        phiChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Phi(t)",
                        data: dataPoints,
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 2,
                        borderDash: [
                            5,
                            5
                        ],
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        pointBackgroundColor: "rgba(75, 192, 192, 1)",
                        pointBorderColor: "#fff",
                        pointBorderWidth: 2,
                        showLine: true
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        type: "time",
                        time: {
                            parser: "date-fns",
                            unit: "day",
                            displayFormats: {
                                day: "MMM d"
                            },
                            tooltipFormat: "MMM d, yyyy HH:mm",
                            minUnit: "day"
                        },
                        ticks: {
                            source: "data"
                        }
                    },
                    y: {
                        min: -20,
                        max: 20
                    }
                }
            }
        });
        console.log("Chart instance created", phiChart);
        phiChartElement.style.display = "block";
    }
    document.getElementById("apply-time-frame").addEventListener("click", ()=>{
        const selectedTimeFrame = parseInt(document.getElementById("time-frame-select").value, 10);
        displayPhiValues(selectedTimeFrame);
    });
});

//# sourceMappingURL=index.c36f364e.js.map
