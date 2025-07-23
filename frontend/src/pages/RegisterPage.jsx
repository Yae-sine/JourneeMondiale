import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/home/Header';
import Footer from '../components/home/Footer';
import { authService } from '../services/authService';

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
    const [fieldErrors, setFieldErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear field error when user starts typing
        if (fieldErrors[e.target.name]) {
            setFieldErrors({
                ...fieldErrors,
                [e.target.name]: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        setFieldErrors({});

        // Validate form data
        const validation = authService.validateRegisterData(formData);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            setLoading(false);
            return;
        }

        try {
            const response = await authService.register(formData);
            console.log('Registration successful:', response);
            
            setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
            
            // Redirect to login page after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Une erreur inattendue s\'est produite.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />
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
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${
                                        fieldErrors.username 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-[#00ACA8] focus:border-[#00ACA8]'
                                    }`}
                                    placeholder="Choisissez un nom d'utilisateur"
                                />
                                {fieldErrors.username && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
                                )}
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
                                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${
                                            fieldErrors.firstName 
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-[#00ACA8] focus:border-[#00ACA8]'
                                        }`}
                                        placeholder="Votre prénom"
                                    />
                                    {fieldErrors.firstName && (
                                        <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
                                    )}
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
                                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${
                                            fieldErrors.lastName 
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-[#00ACA8] focus:border-[#00ACA8]'
                                        }`}
                                        placeholder="Votre nom"
                                    />
                                    {fieldErrors.lastName && (
                                        <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
                                    )}
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
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${
                                        fieldErrors.email 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-[#00ACA8] focus:border-[#00ACA8]'
                                    }`}
                                    placeholder="votre@email.com"
                                />
                                {fieldErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                                )}
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
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${
                                        fieldErrors.password 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-[#00ACA8] focus:border-[#00ACA8]'
                                    }`}
                                    placeholder="Choisissez un mot de passe"
                                />
                                {fieldErrors.password && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                                )}
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
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${
                                        fieldErrors.confirmPassword 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-[#00ACA8] focus:border-[#00ACA8]'
                                    }`}
                                    placeholder="Répétez votre mot de passe"
                                />
                                {fieldErrors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                                )}
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
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#00ACA8] hover:bg-[#00ACA8]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ACA8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                </div>
            </div>
            </div>
            <Footer />
        </div>
    );
}

export default RegisterPage;
