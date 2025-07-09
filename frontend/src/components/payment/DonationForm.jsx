import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { FaTimes, FaHeart, FaSpinner } from 'react-icons/fa';

// Initialize Stripe with your publishable key
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RizbQRZTDnBzTQvLAW6zPk0jhXTBVfmWEpCWW4ISTL92sjPpNJlPEnUNFAkxt62iEo6CQMR8I4Hn4ANnQDEDJRa00gyDSzqE0';

// Debug logging
console.log('Stripe publishable key:', stripePublishableKey);

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

// Donation form component that uses Stripe hooks
const DonationFormContent = ({ onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [amount, setAmount] = useState('50');
  const [customAmount, setCustomAmount] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
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

    if (!email || !name) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    setProcessing(true);
    setError('');
    setMessage('');

    const cardElement = elements.getElement(CardElement);

    // Create token
    const { error: tokenError, token } = await stripe.createToken(cardElement, {
      name: name,
      email: email,
    });

    if (tokenError) {
      setError(tokenError.message);
      setProcessing(false);
      return;
    }

    // Send payment to backend
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/payment/charge`,
        {
          amount: Math.round(parseFloat(amount) * 100), // Convert to cents
          currency: 'EUR',
          stripeToken: token.id,
          stripeEmail: email,
          description: `Don ponctuel de ${amount}€ pour GUSTAVE ROUSSEY`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true, // Include cookies for authentication if needed
        }
      );

      const data = response.data;

      if (response.status === 200 && data.status === 'succeeded') {
        setMessage('Merci pour votre don ! Votre paiement a été traité avec succès.');
        // Reset form after successful payment
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(data.message || 'Une erreur est survenue lors du traitement du paiement');
      }
    } catch (err) {
      if (err.response) {
        // Server responded with error status
        setError(err.response.data.message || 'Une erreur est survenue lors du traitement du paiement');
      } else if (err.request) {
        // Request was made but no response received
        setError('Erreur de connexion. Veuillez réessayer.');
      } else {
        // Something else happened
        setError('Une erreur inattendue est survenue.');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <FaHeart className="text-pink-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Faire un don ponctuel</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Montant du don (€) *
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {predefinedAmounts.map((presetAmount) => (
                <button
                  key={presetAmount}
                  type="button"
                  onClick={() => handleAmountSelect(presetAmount)}
                  className={`p-3 text-center border rounded-lg transition-colors ${
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

          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:border-transparent"
                placeholder="Votre nom complet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          {/* Card Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Informations de carte *
            </label>
            <div className="p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#00ACA8] focus-within:border-transparent">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!stripe || processing}
            className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
          <div className="text-xs text-gray-500 text-center">
            <p>🔒 Paiement sécurisé par Stripe</p>
            <p>Vos données bancaires sont protégées et ne sont pas stockées sur nos serveurs.</p>
            {/* Test mode notice - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                <p className="font-medium">Mode Test - Utilisez ces cartes de test :</p>
                <p>• 4242 4242 4242 4242 (Visa - Succès)</p>
                <p>• 4000 0000 0000 0002 (Visa - Décliné)</p>
                <p>• Date d'expiration : toute date future</p>
                <p>• CVC : tout nombre à 3 chiffres</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// Main component wrapper with Stripe Elements provider
const DonationForm = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Check if Stripe key is available
  if (!stripePublishableKey) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuration Error</h2>
            <p className="text-red-600">Stripe configuration is missing. Please check your environment variables.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <DonationFormContent onClose={onClose} />
    </Elements>
  );
};

export default DonationForm;
