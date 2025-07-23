import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/home/Header';
import Footer from '../components/home/Footer';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';

function LoginPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const navigate = useNavigate();
    const { updateUser } = useUser();

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
        setFieldErrors({});

        // Validate form data
        const validation = authService.validateLoginData(formData);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            setLoading(false);
            return;
        }

        try {
            const response = await authService.login(formData);
            console.log('Login successful:', response);
            
            // Update the user context with the logged-in user data
            updateUser(response);
            
            // Check user role and redirect accordingly
            if (response.role === 'ROLE_ADMIN') {
                navigate('/admin/dashboard');
            } else if (response.role === 'ROLE_USER') {
                navigate('/account/profile');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Erreur de connexion. Veuillez réessayer.');
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
                    Connexion à votre compte
                </h2>
                <p className="mt-2 text-center text-md text-gray-600">
                    Ou{' '}
                    <Link 
                        to="/register" 
                        className="font-medium text-[#00ACA8] hover:text-[#00ACA8]/80 transition-colors"
                    >
                        créez un nouveau compte
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-5 shadow-lg border border-gray-100 sm:rounded-lg sm:px-12">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-md font-semibold text-gray-700">
                                Nom d'utilisateur
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-5 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8] text-lg ${
                                        fieldErrors.username ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Entrez votre nom d'utilisateur"
                                />
                                {fieldErrors.username && (
                                    <p className="mt-2 text-base text-red-600">{fieldErrors.username}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-md font-semibold text-gray-700">
                                Mot de passe
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-5 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8] text-lg ${
                                        fieldErrors.password ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Entrez votre mot de passe"
                                />
                                {fieldErrors.password && (
                                    <p className="mt-2 text-base text-red-600">{fieldErrors.password}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-lg font-bold rounded-lg text-white bg-[#00ACA8] hover:bg-[#00ACA8]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ACA8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Connexion...
                                    </div>
                                ) : (
                                    'Se connecter'
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

export default LoginPage;
