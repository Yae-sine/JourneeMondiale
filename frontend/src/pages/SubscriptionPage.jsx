import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { FaCrown, FaSpinner, FaArrowLeft, FaExclamationTriangle, FaUser, FaEnvelope, FaHeart } from 'react-icons/fa';
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
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[0]);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [processingAction, setProcessingAction] = useState(null); // 'update' | 'cancel' | null

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
          } catch (activationErr) {
            setError('Paiement confirmé mais erreur lors de l\'activation: ' + 
              (activationErr.response?.data?.message || activationErr.message));
          }
        }
      } else {
        setMessage('Abonnement créé avec succès mais pas encore payé !');
        setCurrentSubscription(data);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'abonnement');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateSubscription = async (newPlanId, newPlanName) => {
    setProcessingAction('update');
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
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour de l\'abonnement');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCancelSubscription = async (immediate = false) => {
    setProcessingAction('cancel');
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

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'annulation de l\'abonnement');
    } finally {
      setProcessingAction(null);
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
        <div className="max-w-5xl mx-auto px-6">
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

      {/* Main Content */}
      <div className="flex-grow max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column - Information */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center mb-4">
                <FaHeart className="text-[#00ACA8] text-2xl mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Votre abonnement fait la différence</h2>
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
                {currentSubscription && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-2">Abonnement actuel :</h4>
                    <div className="space-y-1 text-sm">
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
              </div>
            </div>
            <div className="bg-[#f1f8f9] rounded-2xl p-6 border border-[#e0f7fa] shadow-sm">
              <h3 className="font-semibold text-[#00ACA8] mb-2">Pourquoi s'abonner ?</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Votre abonnement soutient la recherche et l'innovation médicale.</li>
                <li>Chaque euro compte pour aider les jeunes adultes atteints de cancer.</li>
                <li>Vous pouvez modifier ou annuler à tout moment.</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Subscription Form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-10 shadow-xl flex flex-col">
            <form className="space-y-8">
              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Plan d'abonnement (€/mois) <span className="text-[#00ACA8]">*</span>
                </label>
                <div className="flex flex-wrap gap-3 mb-4">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowCustomInput(false);
                        setCustomAmount('');
                      }}
                      className={`px-5 py-2 rounded-full border font-medium transition-colors shadow-sm
                        ${selectedPlan?.id === plan.id && !customAmount
                          ? 'bg-[#00ACA8] text-white border-[#00ACA8]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#00ACA8]'}
                        ${currentSubscription?.stripePriceId === plan.id ? 'ring-2 ring-green-500' : ''}
                      `}
                    >
                      {plan.price}€
                      {currentSubscription?.stripePriceId === plan.id && (
                        <span className="ml-1 text-xs">(actuel)</span>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(true);
                      setSelectedPlan(null);
                    }}
                    className={`px-5 py-2 rounded-full border font-medium transition-colors shadow-sm
                      ${showCustomInput
                        ? 'bg-[#00ACA8] text-white border-[#00ACA8]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#00ACA8]'}
                    `}
                  >
                    Autre montant
                  </button>
                </div>
                {showCustomInput && (
                  <input
                    type="number"
                    placeholder="Montant mensuel personnalisé"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    min="5"
                    step="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:border-transparent"
                  />
                )}
              </div>

              {/* Card Information (always visible) */}
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

              {/* Action Buttons (always visible) */}
              <div className="space-y-4">
                {!currentSubscription && (
                  <button
                    type="button"
                    onClick={() => handleCreateSubscription(selectedPlan?.id, selectedPlan?.name)}
                    disabled={!stripe || processing}
                    className="w-full bg-gradient-to-r from-[#00ACA8] to-[#007c7a] text-white py-4 px-6 rounded-lg font-semibold hover:from-[#008a87] hover:to-[#005f5c] focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg shadow-md"
                  >
                    {processing ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <FaCrown className="mr-2" />
                        S'abonner à {selectedPlan?.price}€/mois
                      </>
                    )}
                  </button>
                )}

                {!currentSubscription && showCustomInput && customAmount && parseFloat(customAmount) >= 5 && (
                  <button
                    type="button"
                    onClick={() => handleCreateSubscription(null, `${customAmount}€`)}
                    disabled={!stripe || processing}
                    className="w-full bg-gradient-to-r from-[#00ACA8] to-[#007c7a] text-white py-4 px-6 rounded-lg font-semibold hover:from-[#008a87] hover:to-[#005f5c] focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg shadow-md"
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
                    type="button"
                    onClick={() => handleUpdateSubscription(selectedPlan.id, selectedPlan.name)}
                    disabled={processingAction === 'update'}
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg shadow-md transition-colors"
                  >
                    {processingAction === 'update' ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        Changer pour {selectedPlan.price}€/mois
                      </>
                    )}
                  </button>
                )}

                {currentSubscription && currentSubscription.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => handleCancelSubscription(false)}
                    disabled={processingAction === 'cancel'}
                    className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg shadow-md transition-colors"
                  >
                    {processingAction === 'cancel' ? (
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
                <div className="text-xs text-gray-500 text-center space-y-1 mt-2">
                  <p className="flex items-center justify-center gap-1">
                    <svg className="w-4 h-4 text-[#00ACA8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v.01"/><rect width="20" height="12" x="2" y="7" rx="2"/><path d="M17 9V7a5 5 0 0 0-10 0v2"/></svg>
                    Paiement sécurisé par Stripe
                  </p>
                  <p>Vos données bancaires sont protégées et ne sont pas stockées sur nos serveurs.</p>
                  <p>Annulation possible à tout moment</p>
                  <div className="flex items-center justify-center mt-1">
                    <img src="https://stripe.com/img/v3/home/social.png" alt="Stripe" className="h-5 mr-2" />
                    <span className="text-gray-400">Powered by Stripe</span>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      
      {/* Footer */}
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
