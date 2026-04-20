import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  UserPlus, 
  Video, 
  Calendar, 
  MessageSquare, 
  X,
  Stethoscope,
  Clock,
  MapPin,
  Star,
  CheckCircle,
  LogIn,
  LogOut,
  User,
  LayoutDashboard,
  FileText
} from 'lucide-react';

// --- Authentication Context ---

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // To check local storage

  // On initial load, check if user data is in local storage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse auth from localStorage", error);
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook to easily use the context
export const useAuth = () => {
  return useContext(AuthContext);
};


// --- Reusable Components ---

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-500 w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <button 
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition duration-300"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Chat Modal Component
const ChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm Z.ai, your healthcare assistant. How can I help you today?", sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim() === '') return;
    
    const newUserMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user'
    };
    
    setMessages([...messages, newUserMessage]);
    setInputValue('');
    
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: "I am a demo assistant. For real medical advice, please consult a doctor.",
        sender: 'ai'
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div 
            className="fixed bottom-4 right-4 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 flex flex-col"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <div className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <MessageSquare size={16} />
                </div>
                <h3 className="font-semibold">Chat with Z.ai</h3>
              </div>
              <button onClick={onClose} className="text-white hover:text-blue-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 p-4 h-96 overflow-y-auto">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div 
                    className={`inline-block p-3 rounded-2xl max-w-xs ${
                      message.sender === 'user' 
                        ? 'bg-blue-100 text-gray-800 rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={handleSend}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg transition duration-300"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Doctor Card Component
const DoctorCard = ({ doctor, onBookAppointment }) => {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col"
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6 flex-grow">
        <div className="flex items-start mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <Stethoscope className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
            <p className="text-blue-600 font-medium">{doctor.specialty}</p>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <MapPin className="text-gray-500 w-4 h-4 mr-2" />
            <span className="text-gray-600 text-sm">{doctor.location || 'N/A'}</span>
          </div>
          <div className="flex items-center">
            <Clock className="text-gray-500 w-4 h-4 mr-2" />
            <span className="text-gray-600 text-sm">{doctor.availability}</span>
          </div>
          <div className="flex items-center">
            <Star className="text-yellow-400 w-4 h-4 mr-2" />
            <span className="text-gray-600 text-sm">{doctor.rating}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6 pt-0 mt-auto">
        <button 
          onClick={() => onBookAppointment(doctor)}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition duration-300"
        >
          Book Appointment
        </button>
      </div>
    </motion.div>
  );
};

// --- Navbar Component (MODIFIED) ---
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get user and logout from context

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home after logout
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/doctor-registration', label: 'For Doctors', icon: <UserPlus size={20} /> },
    { path: '/appointment', label: 'Book', icon: <Calendar size={20} /> },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <Stethoscope className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-blue-800">JeevenDhaara</span>
          </Link>
          
          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors duration-300 ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {/* Auth Navigation */}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors duration-300 ${
                    location.pathname === '/dashboard'
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard size={20} className="mr-2" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-medium flex items-center text-red-600 hover:bg-red-100"
                >
                  <LogOut size={20} className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors duration-300 ${
                    location.pathname === '/login'
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LogIn size={20} className="mr-2" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg font-medium flex items-center bg-blue-600 text-white hover:bg-blue-700`}
                >
                  <User size={20} className="mr-2" />
                  Register
                </Link>
              </>
            )}
          </div>
          
          <div className="md:hidden">
            <button className="text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- Page Components ---

// Home Page
const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">JeevenDhaara</h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Affordable Healthcare for Rural Communities - Bringing quality healthcare to every village and home
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { title: 'For Doctors', desc: 'Join our network of healthcare professionals', icon: <UserPlus size={40} />, color: 'bg-blue-100', to: '/doctor-registration' },
            { title: 'Online Consultation', desc: 'Connect with doctors remotely', icon: <Video size={40} />, color: 'bg-green-100', to: '/consultation' },
            { title: 'Book Appointment', desc: 'Schedule in-person visits', icon: <Calendar size={40} />, color: 'bg-purple-100', to: '/appointment' },
            { title: '24/7 Support', desc: 'Healthcare assistance anytime', icon: <MessageSquare size={40} />, color: 'bg-yellow-100', to: '#' },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 text-center"
            >
              <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <div className="text-blue-600">{feature.icon}</div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.desc}</p>
              <Link 
                to={feature.to}
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
              >
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
);

// Doctor Registration Page
const DoctorRegistrationPage = () => {
  const [formData, setFormData] = useState({ name: '', specialty: '', location: '', availability: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }
      
      setShowSuccess(true);
      setFormData({ name: '', specialty: '', location: '', availability: '' });

    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <h1 className="text-3xl font-bold text-blue-800 mb-2">Doctor Registration</h1>
            <p className="text-gray-600 mb-6">Join our network of healthcare professionals</p>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Specialty</label>
                    <input type="text" name="specialty" value={formData.specialty} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Availability</label>
                    <input type="text" name="availability" placeholder="e.g., Mon-Fri, 9AM-5PM" value={formData.availability} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg"
              >
                Register Now
              </button>
            </form>
          </motion.div>
        </div>
      </div>
      
      <SuccessModal 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        message="Your registration has been submitted! You are now part of our trusted network." 
      />
    </div>
  );
};

// Consultation Page
const ConsultationPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:3000/doctors');
        const result = await response.json();
        if (result.success) {
          setDoctors(result.data);
        } else {
          throw new Error('Failed to fetch doctors');
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchDoctors();
  }, []);
  
  const handleStartConsultation = () => {
    if (selectedDoctor) {
      setShowSuccess(true);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Online Consultation</h1>
          <p className="text-gray-600 mb-8">Connect with qualified healthcare professionals remotely</p>
          
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Doctor</h2>
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                    selectedDoctor?.id === doctor.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Stethoscope className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="text-yellow-400 w-4 h-4 mr-1" />
                    <span className="text-sm text-gray-600">{doctor.rating}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedDoctor && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">Selected: {selectedDoctor.name}</h3>
                    <p className="text-gray-600">{selectedDoctor.specialty}</p>
                  </div>
                  <button
                    onClick={handleStartConsultation}
                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
                  >
                    Start Consultation
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      <SuccessModal 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        message={`Your consultation with ${selectedDoctor?.name} has been scheduled! You will receive a confirmation shortly.`} 
      />
    </div>
  );
};

// Appointment Booking Page (MODIFIED)
const AppointmentBookingPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  // MODIFIED: removed patientName
  const [appointmentDetails, setAppointmentDetails] = useState({ date: '', time: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // NEW: Get user and token from context
  const { user, token } = useAuth(); 

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:3000/doctors');
        const data = await response.json();
        if (data.success) {
          setDoctors(data.data);
        } else {
          throw new Error('Failed to load doctors');
        }
      } catch (err) {
        setError('Could not fetch doctor information. Please try again later.');
      }
    };
    fetchDoctors();
  }, []);

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const confirmAppointment = async () => {
    setError('');
    
    // MODIFIED: Updated check
    if (!selectedDoctor || !appointmentDetails.date || !appointmentDetails.time) {
      setError('Please select a doctor, and pick a date and time.');
      return;
    }
    
    // NEW: Check for token
    if (!token || !user) {
      setError('You must be logged in to book an appointment.');
      return;
    }
    
    try {
      // MODIFIED: Added patientId and user.id
      const appointmentData = {
        ...appointmentDetails,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        patientId: user.id // Send patientId from the logged-in user
      };

      const response = await fetch('http://localhost:3000/appointments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // NEW: Send the auth token
        },
        body: JSON.stringify(appointmentData)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Booking failed.');
      }

      setShowSuccess(true);
      setSelectedDoctor(null);
      // MODIFIED: Reset simplified state
      setAppointmentDetails({ date: '', time: '' });
    } catch(err) {
      setError(err.message);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Book an Appointment</h1>
          <p className="text-gray-600 mb-8">Schedule in-person visits with our healthcare professionals</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Doctors</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {doctors.length > 0 ? doctors.map((doctor) => (
                    <DoctorCard 
                      key={doctor.id} 
                      doctor={doctor} 
                      onBookAppointment={handleBookAppointment} 
                    />
                  )) : <p>Loading doctors...</p>}
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                {selectedDoctor ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Book with {selectedDoctor.name}</h2>
                    {/* MODIFIED: Removed patientName input */}
                    <div className="space-y-4">
                        <input type="date" name="date" value={appointmentDetails.date} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required />
                        <input type="time" name="time" value={appointmentDetails.time} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <button onClick={confirmAppointment} className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition duration-300 mt-6">
                      Confirm Appointment
                    </button>
                  </motion.div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="text-gray-400 w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Select a Doctor</h3>
                    <p className="text-gray-600">Choose a doctor from the list to book an appointment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <SuccessModal 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        message={`Your appointment has been confirmed!`} 
      />
    </div>
  );
};

// --- NEW Auth Pages ---

// NEW: Login Page
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // ASSUMES this backend endpoint exists
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      // On successful login, save user data and token in context
      login(data.user, data.token);
      
      // Send them back to where they were trying to go, or to dashboard
      navigate(from, { replace: true });

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">Patient Login</h1>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Password</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                    required 
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg"
              >
                Login
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// NEW: Register Page
const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // ASSUMES this backend endpoint exists
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      }

      setSuccess('Registration successful! Please log in.');
      // Redirect to login page after 2 seconds
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">Create Patient Account</h1>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 mb-6">
                 <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Password</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                    required 
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg"
              >
                Register
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// NEW: Patient Dashboard Page
const DashboardPage = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]); // Placeholder for now
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) return;

      try {
        // ASSUMES this backend endpoint exists and is protected
        const response = await fetch('http://localhost:3000/api/my-appointments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch appointments');
        }
        
        // Assumes data is { success: true, appointments: [...] }
        setAppointments(data.appointments);
      } catch (err) {
        setError(err.message);
      }
    };

    // TODO: Create and call a function to fetch prescriptions
    // fetchPrescriptions();
    
    fetchAppointments();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-blue-800 mb-4">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mb-8">Here's your patient dashboard.</p>
          
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Appointments Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="text-green-500 mr-2" />
                Your Appointments ({appointments.length})
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {appointments.length > 0 ? (
                  appointments.map(app => (
                    <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-lg text-blue-700">Dr. {app.doctorName}</h3>
                      <p className="text-gray-600">Date: {new Date(app.date).toLocaleDateString()}</p>
                      <p className="text-gray-600">Time: {app.time}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">You have no booked appointments.</p>
                )}
              </div>
            </div>

            {/* Prescriptions Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="text-blue-500 mr-2" />
                Your E-Prescriptions ({prescriptions.length})
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* This is a placeholder. You will need to fetch and map prescriptions here. */}
                <p className="text-gray-500">You have no e-prescriptions on file.</p>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};


// --- Utility Components ---

// Floating Chat Button
const FloatingChatButton = ({ onClick }) => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 rounded-full shadow-lg flex items-center justify-center z-40"
    >
      <MessageSquare className="text-white" size={24} />
    </motion.button>
);

// NEW: Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to so we can send them there after they login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};


// --- Main App Component (MODIFIED) ---
const App = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  return (
    // Wrap the entire app in the AuthProvider
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Navbar />
          
          {/* Updated Routes */}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/doctor-registration" element={<DoctorRegistrationPage />} />
            <Route path="/consultation" element={<ConsultationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/appointment" 
              element={
                <ProtectedRoute>
                  <AppointmentBookingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
          
          <FloatingChatButton onClick={() => setIsChatOpen(true)} />
          <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;