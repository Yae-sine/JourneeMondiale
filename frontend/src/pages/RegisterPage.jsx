import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';

function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            setLoading(false);
            return;
        }

        // Prepare data for API (exclude confirmPassword)
        const { confirmPassword, ...apiData } = formData;

        try {
            const response = await axios.post('http://localhost:8080/api/auth/signup', apiData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

            setSuccess('Compte créé avec succès ! Redirection vers la page de connexion...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error('Registration error:', err);
            if (err.response) {
                // Server responded with error status
                setError(err.response.data.message || 'Erreur lors de la création du compte.');
            } else if (err.request) {
                // Request was made but no response received
                setError('Erreur réseau. Veuillez vérifier votre connexion.');
            } else {
                // Something else happened
                setError('Une erreur inattendue s\'est produite.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <img 
                        className="h-20 w-auto" 
                        src="/images/Landing A/Logo-gustave-roussy@2x.png" 
                        alt="Gustave Roussy" 
                    />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Créer votre compte
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Ou{' '}
                    <Link 
                        to="/login" 
                        className="font-medium text-[#00ACA8] hover:text-[#00ACA8]/80 transition-colors"
                    >
                        connectez-vous à votre compte existant
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg border border-gray-100 sm:rounded-lg sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                                {success}
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Nom d'utilisateur *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00ACA8] focus:border-[#00ACA8] sm:text-sm"
                                    placeholder="Choisissez un nom d'utilisateur"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                    Prénom *
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00ACA8] focus:border-[#00ACA8] sm:text-sm"
                                        placeholder="Votre prénom"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                    Nom *
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00ACA8] focus:border-[#00ACA8] sm:text-sm"
                                        placeholder="Votre nom"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00ACA8] focus:border-[#00ACA8] sm:text-sm"
                                    placeholder="votre@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mot de passe *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00ACA8] focus:border-[#00ACA8] sm:text-sm"
                                    placeholder="Choisissez un mot de passe"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Minimum 8 caractères avec lettres et chiffres
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirmer le mot de passe *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00ACA8] focus:border-[#00ACA8] sm:text-sm"
                                    placeholder="Répétez votre mot de passe"
                                />
                            </div>
                        </div>

                        {/* <div className="flex items-center">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                required
                                className="h-4 w-4 text-[#00ACA8] focus:ring-[#00ACA8] border-gray-300 rounded"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                                J'accepte les{' '}
                                <a href="#" className="text-[#00ACA8] hover:text-[#00ACA8]/80">
                                    conditions d'utilisation
                                </a>{' '}
                                et la{' '}
                                <a href="#" className="text-[#00ACA8] hover:text-[#00ACA8]/80">
                                    politique de confidentialité
                                </a>
                            </label>
                        </div> */}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#00ACA8] hover:bg-[#00ACA8]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ACA8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Création du compte...
                                    </div>
                                ) : (
                                    'Créer mon compte'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Ou inscrivez-vous avec</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div>
                                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.46 12.33c0-.77-.07-1.5-.2-2.2H12v4.16h5.85c-.25 1.32-1.02 2.44-2.18 3.19v2.64h3.53c2.07-1.9 3.26-4.7 3.26-8.01z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.53-2.64c-.98.66-2.23 1.05-3.75 1.05-2.88 0-5.32-1.95-6.2-4.56H2.18v2.72C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.8 14.19c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.29H2.18C1.43 8.79 1 10.35 1 12.1c0 1.75.43 3.31 1.18 4.81l3.62-2.72z" fill="#FBBC04"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.1l3.62 2.72c.88-2.61 3.32-4.56 6.2-4.56z" fill="#EA4335"/>
                                    </svg>
                                    <span className="ml-2">Google</span>
                                </button>
                            </div>

                            <div>
                                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                    <span className="ml-2">LinkedIn</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            <Footer />
        </div>
    );
}

export default RegisterPage;
