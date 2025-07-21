import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaPlus, FaTimes, FaCheck } from 'react-icons/fa';
import UserSidebar from '../../components/user/UserSidebar';
import { eventService } from '../../services/eventService';
import { userService } from '../../services/userService';

const UserEvents = () => {
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    participantName: '',
    participantEmail: '',
    notes: ''
  });
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndData = async () => {
      setProfileLoading(true);
      try {
        const profile = await userService.getCurrentUserProfile();
        setRegistrationForm(prev => ({
          ...prev,
          participantName: profile.firstName + ' ' + profile.lastName || '',
          participantEmail: profile.email || ''
        }));
      } catch (err) {
      } finally {
        setProfileLoading(false);
        fetchData();
      }
    };
    fetchProfileAndData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [registrations, events] = await Promise.all([
        eventService.getMyRegistrations(),
        eventService.getUpcomingEvents()
      ]);
      console.log('Fetched registrations:', registrations);
      console.log('Fetched events:', events);

      setMyRegistrations(registrations);
      setUpcomingEvents(events);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (event) => {
    setSelectedEvent(event);
    setShowRegistrationForm(true);
    setRegistrationForm(prev => ({
      ...prev,
      notes: ''
    }));
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await eventService.registerForEvent(selectedEvent.id, registrationForm);
      setSuccessMessage('Inscription réussie à l\'événement!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      setShowRegistrationForm(false);
      setSelectedEvent(null);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setSubmitLoading(false);
    }
  };

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [registrationIdToCancel, setRegistrationIdToCancel] = useState(null);

  const handleCancelRegistration = (registrationId) => {
    setRegistrationIdToCancel(registrationId);
    setShowCancelModal(true);
  };

  const confirmCancelRegistration = async () => {
    if (!registrationIdToCancel) return;
    try {
      await eventService.cancelRegistration(registrationIdToCancel);
      setSuccessMessage('Inscription annulée avec succès');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'annulation');
    } finally {
      setShowCancelModal(false);
      setRegistrationIdToCancel(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (eventDate) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diff = event - now;

    if (diff <= 0) return 'Événement passé';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} jour(s) restant(s)`;
    if (hours > 0) return `${hours} heure(s) restante(s)`;
    return `${minutes} minute(s) restante(s)`;
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'MARATHON': return 'bg-red-100 text-red-800';
      case 'RUN': return 'bg-blue-100 text-blue-800';
      case 'WALK': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'MARATHON': return 'Marathon';
      case 'RUN': return 'Course';
      case 'WALK': return 'Marche';
      default: return type;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <div className="flex-1 p-8">
        <div className="mx-auto">
          {/* Header */}
          <div className="bg-white mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mes Événements
            </h1>
            <p className="text-lg text-gray-600">
              Participez à nos événements solidaires et courez pour la cause
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8 flex items-center text-lg">
              <FaTimes className="mr-3 text-xl" />
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-8 flex items-center text-lg">
              <FaCheck className="mr-3 text-xl" />
              {successMessage}
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500 py-12 text-xl">
              Chargement des événements...
            </div>
          ) : (
            <div className="space-y-8">
              {/* My Registered Events */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Mes Inscriptions
                </h2>
                
                {myRegistrations.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCalendarAlt className="mx-auto text-6xl text-gray-300 mb-4" />
                    <p className="text-xl text-gray-500 mb-6">
                      Aucun événement rejoint pour le moment
                    </p>
                    <p className="text-gray-400">
                      Inscrivez-vous à un événement ci-dessous pour commencer votre aventure solidaire!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {myRegistrations.map((registration) => (
                      <div key={registration.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {registration.event.name}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(registration.event.eventType)}`}>
                                {getEventTypeLabel(registration.event.eventType)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                              <div className="flex items-center">
                                <FaCalendarAlt className="mr-2 text-[#00ACA8]" />
                                <span>{formatDate(registration.event.eventDate)}</span>
                              </div>
                              <div className="flex items-center">
                                <FaMapMarkerAlt className="mr-2 text-[#00ACA8]" />
                                <span>{registration.event.location}</span>
                              </div>
                              <div className="flex items-center">
                                <FaClock className="mr-2 text-[#00ACA8]" />
                                <span className="font-semibold text-[#00ACA8]">
                                  {getTimeRemaining(registration.event.eventDate)}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mt-4">{registration.event.description}</p>
                          </div>
                          
                          <button
                            onClick={() => handleCancelRegistration(registration.id)}
                            className="ml-6 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Annuler
                          </button>
                            {/* Cancel Registration Confirmation Modal */}
                            {showCancelModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900">Confirmer l'annulation</h3>
                                    <button
                                        onClick={() => { setShowCancelModal(false); setRegistrationIdToCancel(null); }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <FaTimes size={20} />
                                    </button>
                                    </div>
                                    <div className="p-6">
                                    <p className="text-gray-700 mb-6">Êtes-vous sûr de vouloir annuler cette inscription ? Cette action est irréversible.</p>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                        onClick={() => { setShowCancelModal(false); setRegistrationIdToCancel(null); }}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                        Annuler
                                        </button>
                                        <button
                                        onClick={confirmCancelRegistration}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                        Confirmer
                                        </button>
                                    </div>
                                    </div>
                                </div>
                                </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Events */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Événements Disponibles
                </h2>
                
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-500">
                      Aucun événement disponible pour le moment
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {upcomingEvents
                      .filter(event => !myRegistrations.some(reg => reg.event.id === event.id))
                      .map((event) => (
                        <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:border-[#00ACA8] transition-colors">
                          <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {event.name}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(event.eventType)}`}>
                              {getEventTypeLabel(event.eventType)}
                            </span>
                          </div>
                          
                          <div className="space-y-3 text-gray-600 mb-4">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-2 text-[#00ACA8]" />
                              <span>{formatDate(event.eventDate)}</span>
                            </div>
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-2 text-[#00ACA8]" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center">
                              <FaUsers className="mr-2 text-[#00ACA8]" />
                              <span>{event.currentParticipants || 0} / {event.maxParticipants} participants</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-6">{event.description}</p>
                          
                          <button
                            onClick={() => handleRegisterClick(event)}
                            disabled={event.currentParticipants >= event.maxParticipants}
                            className="w-full flex items-center justify-center px-6 py-3 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: event.currentParticipants >= event.maxParticipants ? '#9CA3AF' : '#00ACA8' }}
                          >
                            <FaPlus className="mr-2" />
                            {event.currentParticipants >= event.maxParticipants ? 'Événement complet' : 'S\'inscrire'}
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Registration Modal */}
          {showRegistrationForm && selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">
                      S'inscrire à l'événement
                    </h3>
                    <button
                      onClick={() => setShowRegistrationForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>
                  <p className="text-gray-600 mt-2">{selectedEvent.name}</p>
                </div>
                
                <form onSubmit={handleRegistrationSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={registrationForm.participantName}
                      onChange={(e) => setRegistrationForm(prev => ({ ...prev, participantName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={registrationForm.participantEmail}
                      onChange={(e) => setRegistrationForm(prev => ({ ...prev, participantEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes ou commentaires
                    </label>
                    <textarea
                      value={registrationForm.notes}
                      onChange={(e) => setRegistrationForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                      rows="3"
                      placeholder="Allergies, besoins spéciaux, etc."
                    />
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowRegistrationForm(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
                      style={{ backgroundColor: '#00ACA8' }}
                    >
                      {submitLoading ? 'Inscription...' : 'S\'inscrire'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEvents;
