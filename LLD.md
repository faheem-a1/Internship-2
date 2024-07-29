# Low-Level Design Document

## 1. Introduction

This document provides a detailed low-level design for the Clinic Management System, which includes the system architecture, data flow, and component interactions.

## 2. System Architecture 


- **Client Side**: Handles user interface and interactions using HTML, CSS, and JavaScript.
- **Server Side**: Firebase Firestore for data storage and Firebase Authentication for user management.
- **Hosting**: Vercel for deploying the web application.

## 3. Module Descriptions

### 3.1 Authentication Module

- **Purpose**: Handle user login and authentication.
- **Components**:
  - **Firebase Authentication**: Used for managing user sessions.
  - **Session Storage**: Stores the `authToken` to persist user sessions.
  
- **Functionality**:
  - Validate user credentials on login.
  - Redirect unauthorized access attempts to the login page.

### 3.2 Patient Management Module

- **Purpose**: Add, view, update, and delete patient records.
- **Components**:
  - **Firestore Collections**: Stores patient details and medical history.
  
- **Functionality**:
  - **Receptionist** can add new patients and view patient lists.
  - **Doctor** can update patient prescriptions.
  - **Data Validation**: Ensure that all required fields are filled before submission.

### 3.3 Billing Module

- **Purpose**: Generate and print bills for patients.
- **Components**:
  - **Firestore Collections**: Stores billing information linked to patient records.
  
- **Functionality**:
  - Generate a bill once per patient visit.
  - Download/print the bill using a PDF generator.

### 3.4 Contact Management Module

- **Purpose**: Manage contact form submissions.
- **Components**:
  - **Firestore Collections**: Stores contact queries from users.
  
- **Functionality**:
  - Validate form inputs before submission.
  - Store submitted queries in Firestore for later review.

## 4. Data Flow Diagrams

### 4.1 Authentication Flow

- User inputs email and password.
- Firebase Authentication validates credentials.
- Session storage is updated with the `authToken` upon successful login.

### 4.2 Patient Data Flow

- Receptionist inputs patient details.
- Patient details are stored in Firestore.
- Doctors update prescriptions which are saved back to Firestore.

### 4.3 Billing Data Flow

- Billing data generated based on patient services.
- Bill stored in Firestore and available for download as PDF.

## 5. Code Modules

### 5.1 `app.js`

Handles the main logic for user authentication, patient management, and billing.

- **Functions**:
  - `login()`: Validates and logs in users.
  - `logout()`: Clears session and redirects to login.
  - `addPatient()`: Adds a new patient to Firestore.
  - `loadPatients()`: Fetches and displays patients.
  - `addPrescription()`: Updates prescriptions for patients.
  - `generateBill()`: Creates and stores patient bills.

### 5.2 `contact.js`

Handles contact form submissions.

- **Function**:
  - `contact()`: Validates and submits contact form data to Firestore.

## 6. Deployment

- **Hosting Platform**: Vercel
- **Configuration**: `vercel.json` file for routing and static file serving.
- **Domain**: Configured for `wellness-haven-pied.vercel.app`.

## 7. Conclusion

This document outlines the detailed low-level design of the Clinic Management System, ensuring a modular, safe, and maintainable codebase.
