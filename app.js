import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, getDoc, query, where, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC9HBJNap24ZCySN6_hgveIR-4TDavtbjs",
    authDomain: "clinic-management-system-f4ea3.firebaseapp.com",
    projectId: "clinic-management-system-f4ea3",
    storageBucket: "clinic-management-system-f4ea3.appspot.com",
    messagingSenderId: "95407479631",
    appId: "1:95407479631:web:4e5279138b0348b586433a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Track user role globally
let userRole = '';

// Login function
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Logged in as:", user.email);

            // Redirect based on user role
            if (user.email === "faheem@gmail.com") {
                localStorage.setItem('userRole', 'doctor');
                window.location.href = "doctor.html";
            } else if (user.email === "kareem@gmail.com") {
                localStorage.setItem('userRole', 'receptionist');
                window.location.href = "receptionist.html";
            }
        })
        .catch((error) => {
            document.getElementById('login-error').innerText = error.message;
        });
}

// Logout function
function logout() {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
}

// Add patient function (for receptionist)
function addPatient() {
    const patientName = document.getElementById('patient-name').value;
    const patientAge = document.getElementById('patient-age').value;
    const patientBp = document.getElementById('patient-bp').value;
    const patientTemp = document.getElementById('patient-temp').value;
    const patientIssue = document.getElementById('patient-issue').value;
    const token = generateToken();

    addDoc(collection(db, "patients"), {
        name: patientName,
        age: patientAge,
        bp: patientBp,
        temp: patientTemp,
        issue: patientIssue,
        token: token,
        prescription: ""
    }).then(() => {
        alert("Patient added successfully!");
        loadPatients(); // Reload the patient list
    }).catch((error) => {
        console.error("Error adding patient:", error);
    });
}

// Load patients (for both doctor and receptionist)
async function loadPatients() {
    const userRole = localStorage.getItem('userRole');
    const querySnapshot = await getDocs(collection(db, "patients"));
    const patientList = document.getElementById('patient-list');
    patientList.innerHTML = "";

    querySnapshot.forEach(async (docSnapshot) => {
        const patient = docSnapshot.data();
        const patientId = docSnapshot.id;

        // Fetch bill details for the patient
        const billsQuery = query(collection(db, "bills"), where("patientId", "==", patientId));
        const billsSnapshot = await getDocs(billsQuery);
        let billDetails = "No bill generated";

        if (!billsSnapshot.empty) {
            billDetails = billsSnapshot.docs.map(doc => {
                const bill = doc.data();
                return `<p>Bill Amount: ${bill.amount}</p>`;
            }).join('');
        }

        let patientHTML = `
        <div>
            <h3>${patient.name}</h3>
            <p>Age: ${patient.age}</p>
            <p>BP: ${patient.bp} Hg</p>
            <p>Temperature: ${patient.temp} ℃</p>
            <p>Issue: ${patient.issue}</p>
            <p>Token: ${patient.token}</p>
            <p>Prescription: ${patient.prescription}</p>
            ${billDetails}
    `;

        // Check user role and add prescription textbox if doctor
        if (userRole === 'doctor') {
            patientHTML += `
                <textarea id="prescription-${patientId}" placeholder="Add prescription"></textarea>
                <button onclick="addPrescription('${patientId}')">Add Prescription</button>
            `;
        }

        // Check user role and add bill generation button if receptionist
        if (userRole === 'receptionist') {
            patientHTML += `
                <button onclick="generateBill('${patientId}')">Generate Bill</button>
                <button onclick="removePatient('${patientId}')">Remove Patient</button>
            `;
        }

        // Close the patient div
        patientHTML += `</div>`;
        
        // Append the HTML to the patient list
        patientList.innerHTML += patientHTML;
    });
}

// Remove patient function (for receptionist)
function removePatient(patientId) {
    const patientRef = doc(db, "patients", patientId);

    deleteDoc(patientRef).then(() => {
        alert("Patient removed successfully!");
        loadPatients(); // Reload patient list to reflect changes
    }).catch((error) => {
        console.error("Error removing patient:", error);
    });
}

// Add prescription function (for doctor)
function addPrescription(patientId) {
    const prescription = document.getElementById(`prescription-${patientId}`).value;
    
    const patientRef = doc(db, "patients", patientId);

    getDoc(patientRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
            const patient = docSnapshot.data();
            if (patient.prescription.trim() === "") {
                // Add the prescription if it does not already exist
                updateDoc(patientRef, {
                    prescription: prescription
                }).then(() => {
                    alert("Prescription added successfully!");
                    loadPatients(); // Reload the patient list to show updates
                }).catch((error) => {
                    console.error("Error adding prescription:", error);
                });
            } else {
                alert("Prescription already exists for this patient.");
            }
        } else {
            console.error("Patient not found");
        }
    }).catch((error) => {
        console.error("Error fetching patient data:", error);
    });
}

// Generate a unique token
function generateToken() {
    return Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
}

// Generate bill function (for receptionist)
function generateBill(patientId) {
    const patientRef = doc(db, "patients", patientId);
    
    getDoc(patientRef).then(async (docSnapshot) => {
        if (docSnapshot.exists()) {
            const patient = docSnapshot.data();

            // Check if a bill already exists for this patient
            const existingBillsQuery = query(collection(db, "bills"), where("patientId", "==", patientId));
            const existingBillsSnapshot = await getDocs(existingBillsQuery);

            if (existingBillsSnapshot.empty) {
                const billAmount = calculateBill(patient); // Implement this function based on your billing criteria
                
                addDoc(collection(db, "bills"), {
                    patientId: patientId,
                    name: patient.name,
                    amount: billAmount,
                    date: new Date().toISOString()
                }).then(() => {
                    alert("Bill generated successfully!");
                    loadPatients(); // Reload patient list to reflect changes
                }).catch((error) => {
                    console.error("Error generating bill:", error);
                });
            } else {
                alert("Bill has already been generated for this patient.");
            }
        } else {
            console.error("Patient not found");
        }
    }).catch((error) => {
        console.error("Error fetching patient data:", error);
    });
}

// Calculate bill amount
function calculateBill(patient) {
    // Example billing logic; you can customize this based on your requirements
    const baseRate = 100; // Base rate for the visit
    const extraCharges = patient.issue ? 50 : 0; // Additional charges based on the issue
    return baseRate + extraCharges;
}

function contact(){
    const senderName = document.getElementById('name').value.trim();
    const senderEmail = document.getElementById('email').value.trim();
    const message=document.getElementById('message').value.trim();
    if (senderName === '' || senderEmail === '' || message === '') {
        alert('Please fill out all required fields.');
        return false;
    }
    else{
        addDoc(collection(db,"queries"),{
            sendername: senderName,
            senderemail: senderEmail,
            sendermessage: message
        }).then(()=>{
        alert("Submitted"); 
        }).catch((error)=>{
        console.error("Couldn't submit");
    });
}
    
}

// Expose functions to global scope
window.login = login;
window.logout = logout;
window.addPatient = addPatient;
window.addPrescription = addPrescription;
window.generateBill = generateBill;
window.removePatient = removePatient;
window.contact=contact;

// Load patients on page load
window.onload = function() {
    loadPatients();
};