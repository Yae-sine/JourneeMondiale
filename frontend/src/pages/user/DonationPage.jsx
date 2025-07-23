import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { FaHeart, FaSpinner, FaUser, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import UserSidebar from '../../components/user/UserSidebar';
import axios from 'axios';

// Initialize Stripe
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublishableKey);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#424770',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#9e2146',
      iconColor: '#9e2146'
    }
  }
};

const DonationPageContent = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [amount, setAmount] = useState('50');
  const [customAmount, setCustomAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const predefinedAmounts = ['20', '50', '100', '200'];

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setAmount(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate form
    if (!amount || isNaN(amount) || parseFloat(amount) < 1) {
      setError('Veuillez entrer un montant valide (minimum 1€)');
      return;
    }

    setProcessing(true);
    setError('');
    setMessage('');

    try {
      // Step 1: Create Payment Intent on backend
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/payment/create-payment-intent`,
        {
          amount: Math.round(parseFloat(amount) * 100), // Convert to cents
          currency: 'EUR',
          customerEmail: user.email,
          customerName: `${user.firstName} ${user.lastName}`,
          description: `Don ponctuel de ${amount}€ pour GUSTAVE ROUSSEY`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      const { clientSecret } = data;

      // Step 2: Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
            },
          },
        }
      );

      if (confirmError) {
        setError(confirmError.message);
      } else if (paymentIntent.status === 'succeeded') {
        setMessage('Merci pour votre don ! Votre paiement a été traité avec succès.');
        
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/payment/confirm`,
          {
            paymentIntentId: paymentIntent.id,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );
      } else {
        setError('Le paiement n\'a pas pu être traité. Veuillez réessayer.');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Une erreur est survenue lors du traitement du paiement');
      } else if (err.request) {
        setError('Erreur de connexion. Veuillez réessayer.');
      } else {
        setError('Une erreur inattendue est survenue.');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className={`flex-1 p-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Retour"
                >
                  <svg className="w-6 h-6 text-[#00ACA8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FaHeart className="mr-3" style={{ color: '#00ACA8' }} />
                  Faire un don ponctuel
                </h1>
              </div>
              <p className="text-gray-600 mt-1 ml-14">Soutenez la recherche contre le cancer chez les jeunes adultes</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Information */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center mb-4">
                <FaHeart className="text-[#00ACA8] text-2xl mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Votre don fait la différence</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#e0f7fa]">
                    <FaUser className="w-5 h-5 text-[#00ACA8]" />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-700">Nom :</p>
                    <p className="text-gray-600">{user?.firstName} {user?.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#e0f7fa]">
                    <FaEnvelope className="w-5 h-5 text-[#00ACA8]" />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-700">Email :</p>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#f1f8f9] rounded-2xl p-6 border border-[#e0f7fa] shadow-sm">
              <h3 className="font-semibold text-[#00ACA8] mb-2">Pourquoi donner ?</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Votre don soutient la recherche et l’innovation médicale.</li>
                <li>Chaque euro compte pour aider les jeunes adultes atteints de cancer.</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Donation Form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-10 shadow-xl flex flex-col max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Amount Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Montant du don (€) <span className="text-[#00ACA8]">*</span>
                </label>
                <div className="flex flex-wrap gap-3 mb-4">
                  {predefinedAmounts.map((presetAmount) => (
                    <button
                      key={presetAmount}
                      type="button"
                      onClick={() => handleAmountSelect(presetAmount)}
                      className={`px-5 py-2 rounded-full border font-medium transition-colors shadow-sm
                        ${amount === presetAmount && !customAmount
                          ? 'bg-[#00ACA8] text-white border-[#00ACA8]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#00ACA8]'}
                      `}
                    >
                      {presetAmount}€
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Autre montant"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  min="1"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:border-transparent"
                />
              </div>

              {/* Card Information */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Informations de carte <span className="text-[#00ACA8]">*</span>
                </label>
                <div className="p-4 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#00ACA8] focus-within:border-transparent flex items-center gap-3 bg-[#f8fafc]">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#e0f7fa] mr-2">
                    <svg className="w-5 h-5 text-[#00ACA8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 9V7a5 5 0 0 0-10 0v2"/><rect width="20" height="12" x="2" y="9" rx="2"/><path d="M6 15h.01"/></svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <CardElement options={CARD_ELEMENT_OPTIONS} className="w-full block" />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm">{message}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-gradient-to-r from-[#00ACA8] to-[#007c7a] text-white py-4 px-6 rounded-lg font-semibold hover:from-[#008a87] hover:to-[#005f5c] focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg shadow-md"
              >
                {processing ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <FaHeart className="mr-2" />
                    Faire un don de {amount || '0'}€
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="text-xs text-gray-500 text-center space-y-1 mt-2">
                <p className="flex items-center justify-center gap-1">
                  <svg className="w-4 h-4 text-[#00ACA8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v.01"/><rect width="20" height="12" x="2" y="7" rx="2"/><path d="M17 9V7a5 5 0 0 0-10 0v2"/></svg>
                  Paiement sécurisé par Stripe
                </p>
                <p>Vos données bancaires sont protégées et ne sont pas stockées sur nos serveurs.</p>
                <div className="flex items-center justify-center mt-1">
                  <img src="https://stripe.com/img/v3/home/social.png" alt="Stripe" className="h-5 mr-2" />
                  <span className="text-gray-400">Powered by Stripe</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const DonationPage = () => {
  if (!stripePublishableKey) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuration Error</h2>
          <p className="text-red-600">Stripe configuration is missing. Please check your environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <DonationPageContent />
    </Elements>
  );
};

export default DonationPage;
