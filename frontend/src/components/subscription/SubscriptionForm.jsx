import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { FaTimes, FaCrown, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

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

// Subscription plans based on your pricing structure
const SUBSCRIPTION_PLANS = [
  {
    id: process.env.REACT_APP_PRODUCT_ID_1,
    name: "10€",
    price: 10,
    interval: 'month',
  },
  {
    id: process.env.REACT_APP_PRODUCT_ID_2 ,
    name: "15€",
    price: 15,
    interval: 'month',
  },
  {
    id: process.env.REACT_APP_PRODUCT_ID_3 ,
    name: "20€",
    price: 20,
    interval: 'month',
  }
];

const SubscriptionFormContent = ({ onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [userInfo, setUserInfo] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [actionType, setActionType] = useState('create'); // 'create', 'update', 'cancel'

  // Fetch user info and current subscription
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingUser(true);
        
        // Fetch user info
        const userResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/auth/me`,
          { withCredentials: true }
        );
        setUserInfo(userResponse.data);

        // Fetch current subscription
        try {
          const subResponse = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/subscriptions/current`,
            { withCredentials: true }
          );
          
          if (subResponse.data && subResponse.data.id) {
            setCurrentSubscription(subResponse.data);
          }
        } catch (subError) {
          // No active subscription - this is fine
          console.log('No active subscription found');
        }

      } catch (err) {
        console.error('Failed to fetch data:', err);
        if (err.response?.status === 401) {
          setError('Vous devez être connecté pour gérer votre abonnement.');
        } else {
          setError('Erreur lors du chargement des données.');
        }
      } finally {
        setLoadingUser(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateSubscription = async (planId, planName, customPrice = null) => {
    if (!stripe || !elements) return;

    // Validate custom amount if provided
    if (showCustomInput && (!customAmount || parseFloat(customAmount) < 5)) {
      setError('Veuillez entrer un montant valide (minimum 5€)');
      return;
    }

    setProcessing(true);
    setError('');
    setMessage('');

    try {
      // Prepare subscription data
      const subscriptionData = {
        planName: planName || `${customAmount}€`
      };

      // For predefined plans, use the priceId
      if (planId && !showCustomInput) {
        subscriptionData.priceId = planId;
      } 
      // For custom amounts, pass the custom amount to create a price dynamically
      else if (showCustomInput && customAmount) {
        subscriptionData.customAmount = parseFloat(customAmount);
        subscriptionData.planName = `${customAmount}€`;
      } else {
        setError('Veuillez sélectionner un plan ou entrer un montant personnalisé');
        setProcessing(false);
        return;
      }

      // Create subscription
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/subscriptions/create`,
        subscriptionData,
        { withCredentials: true }
      );
      console.log(data)
      // If we have a client secret, we need to confirm the payment
      if (data.clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(
          data.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name: `${userInfo.firstName} ${userInfo.lastName}`,
                email: userInfo.email,
              },
            },
          }
        );

        if (confirmError) {
          setError(confirmError.message);
        } else {
          // Payment confirmed with Stripe, now activate subscription in our database
          try {
            const activationResponse = await axios.post(
              `${process.env.REACT_APP_API_BASE_URL}/api/subscriptions/activate/${data.id}`,
              {},
              { withCredentials: true }
            );

            setMessage('Abonnement créé et activé avec succès !');
            setCurrentSubscription(activationResponse.data);
            setTimeout(() => onClose(), 3000);
          } catch (activationErr) {
            setError('Paiement confirmé mais erreur lors de l\'activation: ' + 
              (activationErr.response?.data?.message || activationErr.message));
          }
        }
      } else {
        setMessage('Abonnement créé avec succès mais pas encore payé !');
        setCurrentSubscription(data);
        setTimeout(() => onClose(), 3000);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'abonnement');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateSubscription = async (newPlanId, newPlanName) => {
    setProcessing(true);
    setError('');
    setMessage('');

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/subscriptions/update`,
        {
          newPriceId: newPlanId,
          newPlanName: newPlanName,
          prorationBehavior: true
        },
        { withCredentials: true }
      );

      setMessage('Abonnement mis à jour avec succès !');
      setCurrentSubscription(data);
      setTimeout(() => onClose(), 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour de l\'abonnement');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async (immediate = false) => {
    setProcessing(true);
    setError('');
    setMessage('');

    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/subscriptions/cancel?immediate=${immediate}`,
        { withCredentials: true }
      );

      setMessage(immediate ? 
        'Abonnement annulé immédiatement.' : 
        'Abonnement programmé pour annulation à la fin de la période.'
      );
      setCurrentSubscription(data);
      setTimeout(() => onClose(), 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'annulation de l\'abonnement');
    } finally {
      setProcessing(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <FaSpinner className="animate-spin mx-auto mb-4 text-2xl text-[#00ACA8]" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <p className="text-red-600 mb-4">Vous devez être connecté pour gérer votre abonnement.</p>
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <FaCrown className="text-yellow-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              {currentSubscription ? 'Gérer l\'abonnement' : 'Choisir un plan de donation'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Current Subscription Info */}
        {currentSubscription && (
          <div className="p-6 border-b bg-blue-50">
            <h3 className="font-semibold text-gray-800 mb-2">Abonnement actuel</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Plan:</span>
                <span className="ml-2 font-medium">{currentSubscription.planName}</span>
              </div>
              <div>
                <span className="text-gray-600">Prix:</span>
                <span className="ml-2 font-medium">{currentSubscription.amount}€/{currentSubscription.interval}</span>
              </div>
              <div>
                <span className="text-gray-600">Statut:</span>
                <span className={`ml-2 font-medium ${
                  currentSubscription.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentSubscription.status}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Renouvellement:</span>
                <span className="ml-2 font-medium">
                  {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Plans Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {SUBSCRIPTION_PLANS.map((plan, index) => (
              <div 
                key={plan.id || `plan-${index}`} // Use plan.id or fallback to index
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlan?.id === plan.id 
                    ? 'border-[#00ACA8] bg-[#00ACA8] bg-opacity-10' 
                    : 'border-gray-300 hover:border-[#00ACA8]'
                } ${
                  currentSubscription?.stripePriceId === plan.id 
                    ? 'ring-2 ring-green-500' 
                    : ''
                }`}
                onClick={() => {
                  setSelectedPlan(plan);
                  setShowCustomInput(false);
                  setCustomAmount('');
                }}
              >
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <div className="text-2xl font-bold text-[#00ACA8]">
                    {plan.price}€<span className="text-sm text-gray-600">/{plan.interval}</span>
                  </div>
                </div>
                {currentSubscription?.stripePriceId === plan.id && (
                  <div className="mt-3 text-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      Plan actuel
                    </span>
                  </div>
                )}
              </div>
            ))}
            
            {/* Custom Amount Option */}
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                showCustomInput 
                  ? 'border-[#00ACA8] bg-[#00ACA8] bg-opacity-10' 
                  : 'border-gray-300 hover:border-[#00ACA8]'
              }`}
              onClick={() => {
                setShowCustomInput(true);
                setSelectedPlan(null);
              }}
            >
              <div className="text-center mb-4">
                <h3 className="font-semibold text-lg">Montant libre</h3>
                <div className="text-lg font-bold text-[#00ACA8]">
                  Votre choix
                </div>
              </div>
            </div>
          </div>

          {/* Custom Amount Input */}
          {showCustomInput && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant mensuel (€) *
              </label>
              <input
                type="number"
                min="5"
                step="1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Entrez le montant souhaité"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ACA8] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Montant minimum: 5€</p>
            </div>
          )}

          {/* Payment Method (only for new subscriptions) */}
          {!currentSubscription && (selectedPlan || (showCustomInput && customAmount)) && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement *
              </label>
              <div className="p-3 border border-gray-300 rounded-lg">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {!currentSubscription && selectedPlan && (
              <button
                onClick={() => handleCreateSubscription(selectedPlan.id, selectedPlan.name)}
                disabled={!stripe || processing}
                className="flex-1 bg-[#00ACA8] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#008a87] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <FaCrown className="mr-2" />
                    S'abonner à {selectedPlan.name}
                  </>
                )}
              </button>
            )}

            {!currentSubscription && showCustomInput && customAmount && parseFloat(customAmount) >= 5 && (
              <button
                onClick={() => handleCreateSubscription(null, `${customAmount}€`)}
                disabled={!stripe || processing}
                className="flex-1 bg-[#00ACA8] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#008a87] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <FaCrown className="mr-2" />
                    S'abonner pour {customAmount}€/mois
                  </>
                )}
              </button>
            )}

            {currentSubscription && selectedPlan && selectedPlan.id !== currentSubscription.stripePriceId && (
              <button
                onClick={() => handleUpdateSubscription(selectedPlan.id, selectedPlan.name)}
                disabled={processing}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    Changer pour {selectedPlan.name}
                  </>
                )}
              </button>
            )}

            {currentSubscription && currentSubscription.status === 'active' && (
              <button
                onClick={() => handleCancelSubscription(false)}
                disabled={processing}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Annulation...
                  </>
                ) : (
                  <>
                    <FaExclamationTriangle className="mr-2" />
                    Annuler l'abonnement
                  </>
                )}
              </button>
            )}
          </div>

          {/* Trial Notice */}
          {!currentSubscription && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>🔒 Paiement sécurisé par Stripe - Annulation possible à tout moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main component wrapper
const SubscriptionForm = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  if (!stripePublishableKey) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuration Error</h2>
            <p className="text-red-600">Stripe configuration is missing.</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <SubscriptionFormContent onClose={onClose} />
    </Elements>
  );
};

export default SubscriptionForm;
