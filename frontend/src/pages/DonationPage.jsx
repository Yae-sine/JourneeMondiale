import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { FaHeart, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import withAuth from '../components/auth/withAuth';
import Footer from '../components/home/Footer';
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
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/payment/create-payment-intent`,
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
        
        // Optional: Notify backend of successful payment
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/payment/confirm`,
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

        // Reset form after successful payment
        setTimeout(() => {
          navigate('/');
        }, 3000);
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-[#00ACA8] text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white hover:text-gray-200 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Retour à l'accueil
          </button>
          <div className="flex items-center">
            <FaHeart className="mr-3 text-2xl" />
            <h1 className="text-3xl font-bold">Faire un don ponctuel</h1>
          </div>
          <p className="mt-2 text-lg opacity-90">
            Soutenez la recherche contre le cancer chez les jeunes adultes
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Votre don fait la différence
            </h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Informations du donateur</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Nom :</strong> {user?.firstName} {user?.lastName}</p>
                  <p><strong>Email :</strong> {user?.email}</p>
                </div>
              </div>

              <div className="bg-[#00ACA8] bg-opacity-10 p-6 rounded-lg border border-[#00ACA8] border-opacity-30">
                <h3 className="font-semibold text-[#00ACA8] mb-3">Impact de votre don</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Financement de la recherche exploratoire</li>
                  <li>• Développement de nouveaux traitements</li>
                  <li>• Amélioration de la qualité de vie des patients</li>
                  <li>• Prévention et détection précoce</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  <strong>Avantage fiscal :</strong> Votre don ouvre droit à une réduction d'impôt de 66% 
                  dans la limite de 20% de votre revenu imposable.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Donation Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Montant du don (€) *
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {predefinedAmounts.map((presetAmount) => (
                    <button
                      key={presetAmount}
                      type="button"
                      onClick={() => handleAmountSelect(presetAmount)}
                      className={`p-3 text-center border rounded-lg transition-colors font-medium ${
                        amount === presetAmount && !customAmount
                          ? 'border-[#00ACA8] bg-[#00ACA8] text-white'
                          : 'border-gray-300 hover:border-[#00ACA8] text-gray-700'
                      }`}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Informations de carte *
                </label>
                <div className="p-4 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#00ACA8] focus-within:border-transparent">
                  <CardElement options={CARD_ELEMENT_OPTIONS} />
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
                className="w-full bg-[#00ACA8] text-white py-4 px-6 rounded-lg font-semibold hover:bg-[#008a87] focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
              <div className="text-xs text-gray-500 text-center space-y-1">
                <p>🔒 Paiement sécurisé par Stripe</p>
                <p>Vos données bancaires sont protégées et ne sont pas stockées sur nos serveurs.</p>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Footer - will stick to bottom */}
      <Footer />
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

export default withAuth(DonationPage);
