import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer';

function Unauthorized() {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    {/* Icon */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                                <ShieldExclamationIcon className="w-12 h-12 text-red-600" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#00ACA8] rounded-full flex items-center justify-center">
                                <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Error Code */}
                    <div>
                        <h1 className="text-6xl font-bold text-gray-900">403</h1>
                    </div>

                    {/* Main Message */}
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Accès non autorisé
                        </h2>
                        <p className="text-gray-600">
                            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                        </p>
                    </div>

                    {/* Details */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Que s'est-il passé ?
                        </h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Vous tentez d'accéder à une zone restreinte</li>
                            <li>• Votre rôle utilisateur ne permet pas cet accès</li>
                            <li>• Cette page est réservée aux administrateurs</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <button
                            onClick={handleGoBack}
                            className="w-full bg-[#00ACA8] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#00ACA8]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ACA8]"
                        >
                            Retour à la page précédente
                        </button>
                        
                        <Link
                            to="/"
                            className="w-full inline-block bg-white text-[#00ACA8] py-3 px-4 rounded-lg font-medium border-2 border-[#00ACA8] hover:bg-[#00ACA8]/5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ACA8]"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>

                    {/* Contact Support */}
                    <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            Besoin d'aide ? {' '}
                            <div 
                                className="text-[#00ACA8] hover:text-[#00ACA8]/80 font-medium"
                            >
                                Contactez le support via le mail : aboulhajyassine@gmail.com
                            </div>
                        </p>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00ACA8] to-[#00ACA8]/60"></div>
            <div className="absolute top-20 left-10 w-16 h-16 bg-[#00ACA8]/10 rounded-full"></div>
            
            <Footer />
        </div>
    );
}

export default Unauthorized;
