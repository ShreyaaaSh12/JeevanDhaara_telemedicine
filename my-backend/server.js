// Import necessary modules
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // You MUST install this: npm install jsonwebtoken

// Initialize the Express app
const app = express();
const PORT = 3000;

// --- !! IMPORTANT: Change this to a long, random string !! ---
const JWT_SECRET = 'YOUR_SUPER_SECRET_KEY_GOES_HERE';

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE FILE PATHS ---
const DOCTORS_FILE = './doctors.json';
const APPOINTMENTS_FILE = './appointments.json';
const USERS_FILE = './users.json';
const PRESCRIPTIONS_FILE = './prescriptions.json';

// --- HELPER FUNCTIONS ---
const readDataFromFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            return []; // Return empty array if file doesn't exist
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeDataToFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// --- AUTHENTICATION MIDDLEWARE ---
// This function will "protect" our routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Token is invalid.' });
        }
        req.user = user; // Add the user payload (e.g., { id, email }) to the request
        next();
    });
};

// --- API ENDPOINTS ---

// --- Doctor Endpoints (Public) ---

// GET: Fetch all doctors
app.get('/doctors', (req, res) => {
    const doctors = readDataFromFile(DOCTORS_FILE);
    res.json({ success: true, data: doctors });
});

// POST: Register a new doctor
app.post('/doctors', (req, res) => {
    const { name, specialty, location, availability } = req.body;
    if (!name || !specialty || !location || !availability) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const doctors = readDataFromFile(DOCTORS_FILE);
    const newDoctor = {
        id: crypto.randomUUID(),
        name, specialty, location, availability,
        rating: (Math.random() * (5 - 4.2) + 4.2).toFixed(1)
    };
    doctors.push(newDoctor);
    writeDataToFile(DOCTORS_FILE, doctors);
    res.status(201).json({ success: true, message: 'Doctor registered successfully.', data: newDoctor });
});

// --- Auth Endpoints (Public) ---

// POST: Register a new patient/user
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    const users = readDataFromFile(USERS_FILE);

    // Check if user already exists
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'Email already in use.' });
    }

    // WARNING: Storing plain text passwords. This is NOT secure for production.
    // For a real app, you MUST hash the password using a library like bcrypt.
    const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password // Storing plain text password for simplicity of this example
    };

    users.push(newUser);
    writeDataToFile(USERS_FILE, users);

    res.status(201).json({ success: true, message: 'User registered successfully!' });
});

// POST: Login a patient/user
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const users = readDataFromFile(USERS_FILE);

    // Find user
    const user = users.find(u => u.email === email);
    
    // Check password (plain text check, NOT SECURE)
    if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // User is valid, create a JWT
    const tokenPayload = { id: user.id, email: user.email, name: user.name };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    // Return the token and user info (without password)
    res.json({
        success: true,
        message: 'Login successful!',
        token: token,
        user: { id: user.id, name: user.name, email: user.email }
    });
});

// --- Appointment Endpoints (Protected) ---

// POST: Book a new appointment (Protected)
app.post('/appointments', authenticateToken, (req, res) => {
    // patientId comes from the token (req.user), not the body
    const patientId = req.user.id;
    const { date, time, doctorId, doctorName } = req.body;

    if (!date || !time || !doctorId) {
        return res.status(400).json({ success: false, message: 'Date, time, and doctor are required.' });
    }

    const appointments = readDataFromFile(APPOINTMENTS_FILE);
    const newAppointment = {
        id: crypto.randomUUID(),
        patientId, // The ID of the logged-in user
        date,
        time,
        doctorId,
        doctorName,
        status: "Scheduled",
        bookedAt: new Date().toISOString()
    };
    appointments.push(newAppointment);
    writeDataToFile(APPOINTMENTS_FILE, appointments);
    res.status(201).json({ success: true, message: 'Appointment booked successfully.', data: newAppointment });
});

// GET: Get appointments for the logged-in user (Protected)
app.get('/api/my-appointments', authenticateToken, (req, res) => {
    const patientId = req.user.id;
    const allAppointments = readDataFromFile(APPOINTMENTS_FILE);
    
    const myAppointments = allAppointments.filter(app => app.patientId === patientId);

    res.json({ success: true, appointments: myAppointments });
});


// --- Prescription Endpoints (Protected) ---

// GET: Get prescriptions for the logged-in user
app.get('/api/my-prescriptions', authenticateToken, (req, res) => {
    const patientId = req.user.id;
    const allPrescriptions = readDataFromFile(PRESCRIPTIONS_FILE);
    const myPrescriptions = allPrescriptions.filter(p => p.patientId === patientId);
    res.json({ success: true, prescriptions: myPrescriptions });
});

// POST: Create a new prescription
app.post('/api/prescriptions', authenticateToken, (req, res) => {
    // In a real app, you'd check if the user is a doctor
    
    const { patientId, doctorId, doctorName, diagnosis, medications, doctorNotes } = req.body;

    if (!patientId || !doctorId || !diagnosis || !medications) {
        return res.status(400).json({ success: false, message: 'Missing required prescription fields.' });
    }

    const prescriptions = readDataFromFile(PRESCRIPTIONS_FILE);
    const newPrescription = {
        id: crypto.randomUUID(),
        patientId,
        doctorId,
        doctorName,
        diagnosis,
        medications,
        doctorNotes,
        consultationDate: new Date().toISOString()
    };
    
    prescriptions.push(newPrescription);
    writeDataToFile(PRESCRIPTIONS_FILE, prescriptions);
    res.status(201).json({ success: true, message: 'Prescription created.', data: newPrescription });
});


// --- START THE SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 JeevenDhaara backend server is running on http://localhost:${PORT}`);
});