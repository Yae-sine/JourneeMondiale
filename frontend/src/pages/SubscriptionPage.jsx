import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { FaCrown, FaSpinner, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
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

// Subscription plans based on your pricing structure
const SUBSCRIPTION_PLANS = [
  {
    id: process.env.REACT_APP_PRODUCT_ID_1,
    name: "10€",
    price: 10,
    interval: 'month',
  },
  {
    id: process.env.REACT_APP_PRODUCT_ID_2,
    name: "15€",
    price: 15,
    interval: 'month',
  },
  {
    id: process.env.REACT_APP_PRODUCT_ID_3,
    name: "20€",
    price: 20,
    interval: 'month',
  }
];

const SubscriptionPageContent = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Fetch current subscription
  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      try {
        setLoadingSubscription(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/subscriptions/current`,
          { withCredentials: true }
        );
        
        if (response.data && response.data.id) {
          setCurrentSubscription(response.data);
        }
      } catch (err) {
        // No active subscription - this is fine
        console.log('No active subscription found');
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchCurrentSubscription();
  }, []);

  const handleCreateSubscription = async (planId, planName) => {
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

      // If we have a client secret, we need to confirm the payment
      if (data.clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(
          data.clientSecret,
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
            setTimeout(() => {
              navigate('/');
            }, 3000);
          } catch (activationErr) {
            setError('Paiement confirmé mais erreur lors de l\'activation: ' + 
              (activationErr.response?.data?.message || activationErr.message));
          }
        }
      } else {
        setMessage('Abonnement créé avec succès mais pas encore payé !');
        setCurrentSubscription(data);
        setTimeout(() => {
          navigate('/');
        }, 3000);
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
        `${process.env.REACT_APP_API_BASE_URL}/api/subscriptions/update`,
        {
          newPriceId: newPlanId,
          newPlanName: newPlanName,
          prorationBehavior: true
        },
        { withCredentials: true }
      );

      setMessage('Abonnement mis à jour avec succès !');
      setCurrentSubscription(data);
      setTimeout(() => {
        navigate('/');
      }, 3000);

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
        `${process.env.REACT_APP_API_BASE_URL}/api/subscriptions/cancel?immediate=${immediate}`,
        { withCredentials: true }
      );

      setMessage(immediate ? 
        'Abonnement annulé immédiatement.' : 
        'Abonnement programmé pour annulation à la fin de la période.'
      );
      setCurrentSubscription(data);
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'annulation de l\'abonnement');
    } finally {
      setProcessing(false);
    }
  };

  if (loadingSubscription) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto mb-4 text-3xl text-[#00ACA8]" />
          <p className="text-gray-600">Chargement de vos informations d'abonnement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-[#00ACA8] text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white hover:text-gray-200 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Retour à l'accueil
          </button>
          <div className="flex items-center">
            <FaCrown className="mr-3 text-2xl" />
            <h1 className="text-3xl font-bold">
              {currentSubscription ? 'Gérer votre abonnement' : 'Choisir un plan d\'abonnement'}
            </h1>
          </div>
          <p className="mt-2 text-lg opacity-90">
            Soutenez régulièrement la recherche contre le cancer chez les jeunes adultes
          </p>
        </div>
      </div>

      {/* Current Subscription Info */}
      {currentSubscription && (
        <div className="bg-blue-50 border-b">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <h2 className="font-semibold text-gray-800 mb-4">Abonnement actuel</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
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
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Information */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Pourquoi s'abonner ?
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
                <h3 className="font-semibold text-[#00ACA8] mb-3">Avantages de l'abonnement</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Soutien régulier et prévisible</li>
                  <li>• Financement de projets à long terme</li>
                  <li>• Annulation possible à tout moment</li>
                  <li>• Réduction d'impôt de 66%</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  <strong>Gestion flexible :</strong> Vous pouvez modifier ou annuler votre abonnement 
                  à tout moment.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Plans and Form */}
          <div className="lg:col-span-2">
            {/* Plans Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {SUBSCRIPTION_PLANS.map((plan, index) => (
                <div 
                  key={plan.id || `plan-${index}`}
                  className={`border rounded-lg p-6 cursor-pointer transition-all ${
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
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                    <div className="text-2xl font-bold text-[#00ACA8] mb-4">
                      {plan.price}€<span className="text-sm text-gray-600">/{plan.interval}</span>
                    </div>
                    {currentSubscription?.stripePriceId === plan.id && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
                        Plan actuel
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Custom Amount Option */}
              <div 
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  showCustomInput 
                    ? 'border-[#00ACA8] bg-[#00ACA8] bg-opacity-10' 
                    : 'border-gray-300 hover:border-[#00ACA8]'
                }`}
                onClick={() => {
                  setShowCustomInput(true);
                  setSelectedPlan(null);
                }}
              >
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Montant libre</h3>
                  <div className="text-lg font-bold text-[#00ACA8]">
                    Votre choix
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Amount Input */}
            {showCustomInput && (
              <div className="mb-8">
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
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de paiement *
                </label>
                <div className="p-4 border border-gray-300 rounded-lg">
                  <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{message}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {!currentSubscription && selectedPlan && (
                <button
                  onClick={() => handleCreateSubscription(selectedPlan.id, selectedPlan.name)}
                  disabled={!stripe || processing}
                  className="w-full bg-[#00ACA8] text-white py-4 px-6 rounded-lg font-semibold hover:bg-[#008a87] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
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
                  className="w-full bg-[#00ACA8] text-white py-4 px-6 rounded-lg font-semibold hover:bg-[#008a87] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
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
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
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
                  className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
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

            {/* Security Notice */}
            {!currentSubscription && (
              <div className="mt-8 text-xs text-gray-500 text-center">
                <p>🔒 Paiement sécurisé par Stripe - Annulation possible à tout moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer - will stick to bottom */}
      <Footer />
    </div>
  );
};

const SubscriptionPage = () => {
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
      <SubscriptionPageContent />
    </Elements>
  );
};

export default withAuth(SubscriptionPage);
