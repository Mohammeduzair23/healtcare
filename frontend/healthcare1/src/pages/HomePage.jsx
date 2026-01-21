import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, UserCircle, Stethoscope, Shield, Users, Calendar, FileText, ArrowRight } from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Name - Left Side */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MediCare Hub
                </h1>
                <p className="text-xs text-gray-500">Your Healthcare Companion</p>
              </div>
            </div>

            {/* Desktop Menu - Center */}
              <div className="hidden md:flex space-x-8">
                <button 
                  onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Home
                </button>
                <button 
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Services
                </button>
                <button 
                  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  About
                </button>
                <button 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Contact
                </button>
              </div>


            {/* Login Button and Menu Icon - Right Side */}
            <div className="flex items-center space-x-4">
              {/* Login Button with Circle Icon */}
              <Link to="/login" 
                className="hidden md:flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-200"
              > 
                <UserCircle className="w-5 h-5" />
                <span className="font-medium">Login</span>
              </Link>

              {/* Mobile Login Button */}
              <button
                onClick={() => navigate('/login')}
                className="md:hidden bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
              >
                <UserCircle className="w-6 h-6" />
              </button>

              {/* Hamburger Menu Icon */}
              <button
                onClick={toggleMenu}
                className="md:hidden text-gray-700 hover:text-blue-600 transition"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              
                <a href="#home"
                className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
                >
                Home
                </a>
              
                <a href="#services"
                className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
                >
                Services
                </a>
              
                <a href="#about"
                className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
                >
                About
                </a>
              
                <a href="#contact"
                className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
                >
                Contact
                </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Your Health,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Our Priority
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Connect with the best doctors, manage your health records, and book appointments - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {/*<button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition duration-200 flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>*/}
              <Link to="/register" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition duration-200 flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              {/*<Link to="/login"
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold border-2 border-blue-600 hover:bg-blue-50 transition duration-200"
              >
              Sign In
              </Link>*/}
            </div>
          </div>

          {/* Right Image/Illustration */}
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl p-8 shadow-2xl">
              <img
                src="https://stories.freepiklabs.com/storage/6446/328-Doctors-(1)_Artboard-1.svg"
                alt="Healthcare"
                className="rounded-2xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">
              Comprehensive healthcare solutions for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Patient Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-200 border-2 border-blue-200">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Patients</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Book appointments instantly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Access medical records</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Online consultations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Prescription management</span>
                </li>
              </ul>
            </div>

            {/* Doctor Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-200 border-2 border-green-200">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Doctors</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Manage appointments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Patient records access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Digital prescriptions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Video consultations</span>
                </li>
              </ul>
            </div>

            {/* Lab Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-200 border-2 border-purple-200">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Labs</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span>High tech Machines</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span>Different Scan </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span>Reliable</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span>On Time Service</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
                {/*about page */}
      <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About MediCare Hub</h2>
            <p className="text-xl text-gray-600">
              Revolutionizing healthcare management with technology
            </p>
          </div>
          </div>
          </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <Users className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-4xl font-bold mb-2">10,000+</h3>
              <p className="text-blue-100">Active Users</p>
            </div>
            <div>
              <Stethoscope className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-4xl font-bold mb-2">500+</h3>
              <p className="text-blue-100">Verified Doctors</p>
            </div>
            <div>
              <Calendar className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-4xl font-bold mb-2">50,000+</h3>
              <p className="text-blue-100">Appointments</p>
            </div>
            <div>
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-4xl font-bold mb-2">100%</h3>
              <p className="text-blue-100">Secure & Private</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who trust MediCare Hub for their healthcare needs
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-full font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition duration-200"
          >
            Create Your Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MediCare Hub</h3>
              <p className="text-gray-400">
                Your trusted healthcare companion for a healthier tomorrow.
              </p>
            </div>
            {/*<div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#home" className="hover:text-white">Home</a></li>
                <li><a href="#services" className="hover:text-white">Services</a></li>
                <li><a href="#about" className="hover:text-white">About</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>*/}

              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <button 
                      onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
                      className="hover:text-white"
                    >
                      Home
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                      className="hover:text-white"
                    >
                      Services
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                      className="hover:text-white"
                    >
                      About
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                      className="hover:text-white"
                    >
                      Contact
                    </button>
                  </li>
                </ul>
              </div>

            <div>
              <h4 className="font-semibold mb-4">For Users</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a className="hover:text-white">Patient Portal</a></li>
                <li><a className="hover:text-white">Doctor Portal</a></li>
                <li><a className="hover:text-white">Admin Panel</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@medicarehub.com</li>
                <li>Phone: +1 234 567 8900</li>
                <li>Address: 123 Health St</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MediCare Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;