import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useUser();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };

    return (
        <header className="bg-white/95 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50 shadow-sm">
            <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="flex items-center">
                            <img 
                                className="h-12 w-auto" 
                                src="/images/Landing A/Logo-gustave-roussy@2x.png" 
                                alt="Gustave Roussy" 
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-9">
                        <Link 
                            to="/account/profile" 
                            className={`font-medium transition-colors duration-200 relative group ${
                                isActive('/account/profile') 
                                    ? 'text-[#00ACA8]' 
                                    : 'text-gray-700 hover:text-[#00ACA8]'
                            }`}
                        >
                            Profil
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#00ACA8] transition-all duration-300 ${
                                isActive('/account/profile') ? 'w-full' : 'w-0 group-hover:w-full'
                            }`}></span>
                        </Link>
                        <Link 
                            to="/account/donations" 
                            className={`font-medium transition-colors duration-200 relative group ${
                                isActive('/account/donations') 
                                    ? 'text-[#00ACA8]' 
                                    : 'text-gray-700 hover:text-[#00ACA8]'
                            }`}
                        >
                            Donations
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#00ACA8] transition-all duration-300 ${
                                isActive('/account/donations') ? 'w-full' : 'w-0 group-hover:w-full'
                            }`}></span>
                        </Link>
                        <Link 
                            to="/account/subscription" 
                            className={`font-medium transition-colors duration-200 relative group ${
                                isActive('/account/subscription') 
                                    ? 'text-[#00ACA8]' 
                                    : 'text-gray-700 hover:text-[#00ACA8]'
                            }`}
                        >
                            Abonnements
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#00ACA8] transition-all duration-300 ${
                                isActive('/account/subscription') ? 'w-full' : 'w-0 group-hover:w-full'
                            }`}></span>
                        </Link>
                        <Link 
                            to="/account/events" 
                            className={`font-medium transition-colors duration-200 relative group ${
                                isActive('/account/events') 
                                    ? 'text-[#00ACA8]' 
                                    : 'text-gray-700 hover:text-[#00ACA8]'
                            }`}
                        >
                            Événements
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#00ACA8] transition-all duration-300 ${
                                isActive('/account/events') ? 'w-full' : 'w-0 group-hover:w-full'
                            }`}></span>
                        </Link>
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600">
                                    Bonjour, {user.firstName}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
                                >
                                    Déconnexion
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-[#00ACA8] px-4 py-2 rounded-lg font-medium transition-colors duration-300"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-[#00ACA8] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#00ACA8]/90 transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    Inscription
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>

                {/* Mobile menu */}
                <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-lg`}>
                    <div className="px-4 py-6 space-y-4">
                        <Link 
                            to="/account/profile" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-gray-700 hover:text-[#00ACA8] font-medium py-2 transition-colors duration-200"
                        >
                            Profil
                        </Link>
                        <Link 
                            to="/account/donations" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-gray-700 hover:text-[#00ACA8] font-medium py-2 transition-colors duration-200"
                        >
                            Donations
                        </Link>
                        <Link 
                            to="/account/subscription" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-gray-700 hover:text-[#00ACA8] font-medium py-2 transition-colors duration-200"
                        >
                            Abonnements
                        </Link>
                        <Link 
                            to="/account/events" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-gray-700 hover:text-[#00ACA8] font-medium py-2 transition-colors duration-200"
                        >
                            Événements
                        </Link>
                        <div className="pt-4 space-y-3">
                            {user ? (
                                <div className="flex flex-col items-center space-y-3">
                                    <span className="text-sm text-gray-600 w-full text-center">
                                        Bonjour, {user.firstName}
                                    </span>
                                    <button
                                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                        className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
                                    >
                                        Déconnexion
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full text-center text-gray-700 hover:text-[#00ACA8] px-4 py-2 rounded-lg font-medium transition-colors duration-300 border border-gray-300"
                                    >
                                        Connexion
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full text-center bg-[#00ACA8] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#00ACA8]/90 transition-all duration-300 shadow-md hover:shadow-lg"
                                    >
                                        Inscription
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;