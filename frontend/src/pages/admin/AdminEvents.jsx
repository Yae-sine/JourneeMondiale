import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaEye } from 'react-icons/fa';
import AdminSidebar from '../../components/admin/sidebar';
import { eventService } from '../../services/eventService';

const AdminEvents = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState(null);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    location: '',
    eventDate: '',
    registrationDeadline: '',
    maxParticipants: '',
    eventType: 'RUN',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const eventsData = await eventService.getAllEvents();
      console.log('Fetched events:', eventsData);
      setEvents(eventsData);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des événements');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setEventForm({
      name: '',
      description: '',
      location: '',
      eventDate: '',
      registrationDeadline: '',
      maxParticipants: '',
      eventType: 'RUN',
    });
    setShowEventForm(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name,
      description: event.description,
      location: event.location,
      eventDate: new Date(event.eventDate).toISOString().slice(0, 16),
      registrationDeadline: new Date(event.registrationDeadline).toISOString().slice(0, 16),
      maxParticipants: event.maxParticipants.toString(),
      eventType: event.eventType,
    });
    setShowEventForm(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const eventData = {
        ...eventForm,
        eventDate: new Date(eventForm.eventDate).toISOString(),
        registrationDeadline: new Date(eventForm.registrationDeadline).toISOString(),
        maxParticipants: parseInt(eventForm.maxParticipants)
      };

      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, eventData);
        setSuccessMessage('Événement mis à jour avec succès!');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        await eventService.createEvent(eventData);
        setSuccessMessage('Événement créé avec succès!');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }

      setShowEventForm(false);
      fetchEvents();
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde de l\'événement');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteEvent = (eventId) => {
    setEventIdToDelete(eventId);
    setShowDeleteModal(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventIdToDelete) return;
    try {
      await eventService.deleteEvent(eventIdToDelete);
      setSuccessMessage('Événement supprimé avec succès!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchEvents();
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression');
    } finally {
      setShowDeleteModal(false);
      setEventIdToDelete(null);
    }
  };

  const handleViewRegistrations = async (event) => {
    setSelectedEvent(event);
    try {
      const registrations = await eventService.getEventRegistrations(event.id);
      setEventRegistrations(registrations);
      setShowRegistrationsModal(true);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des inscriptions');
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
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className={`flex-1 p-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des Événements
              </h1>
              <p className="text-lg text-gray-600">
                Gérez les événements solidaires et les inscriptions
              </p>
            </div>
            <button
              onClick={handleCreateEvent}
              className="flex items-center px-6 py-3 text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#00ACA8' }}
            >
              <FaPlus className="mr-2" />
              Nouvel Événement
            </button>
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

          {/* Events List */}
          {loading ? (
            <div className="text-center text-gray-500 py-12 text-xl">
              Chargement des événements...
            </div>
          ) : (
            events.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md flex items-center justify-center py-16 text-gray-500 text-xl">
                Aucun événement disponible
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Événement
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Date & Lieu
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Participants
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-lg font-medium text-gray-900">
                                {event.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {event.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <FaCalendarAlt className="mr-2 text-[#00ACA8]" />
                                {formatDate(event.eventDate)}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <FaMapMarkerAlt className="mr-2 text-[#00ACA8]" />
                                {event.location}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <FaUsers className="mr-2 text-[#00ACA8]" />
                              <span className="text-sm text-gray-900">
                               {event.currentParticipants || 0 } / {event.maxParticipants}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(event.eventType)}`}>
                              {getEventTypeLabel(event.eventType)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewRegistrations(event)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Voir les inscriptions"
                              >
                                <FaEye size={16} />
                              </button>
                              <button
                                onClick={() => handleEditEvent(event)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <FaEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <FaTrash size={16} />
                              </button>
                                {/* Delete Confirmation Modal */}
                                {showDeleteModal && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
                                        <button
                                            onClick={() => { setShowDeleteModal(false); setEventIdToDelete(null); }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <FaTimes size={20} />
                                        </button>
                                        </div>
                                        <div className="p-6">
                                        <p className="text-gray-700 mb-6">Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.</p>
                                        <div className="flex justify-end space-x-4">
                                            <button
                                            onClick={() => { setShowDeleteModal(false); setEventIdToDelete(null); }}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                            >
                                            Annuler
                                            </button>
                                            <button
                                            onClick={confirmDeleteEvent}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                            Supprimer
                                            </button>
                                        </div>
                                        </div>
                                    </div>
                                    </div>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* Event Form Modal */}
          {showEventForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {editingEvent ? 'Modifier l\'événement' : 'Créer un nouvel événement'}
                    </h3>
                    <button
                      onClick={() => setShowEventForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleEventSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'événement *
                      </label>
                      <input
                        type="text"
                        value={eventForm.name}
                        onChange={(e) => setEventForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={eventForm.description}
                        onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                        rows="4"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lieu *
                      </label>
                      <input
                        type="text"
                        value={eventForm.location}
                        onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type d'événement *
                      </label>
                      <select
                        value={eventForm.eventType}
                        onChange={(e) => setEventForm(prev => ({ ...prev, eventType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                        required
                      >
                        <option value="RUN">Course</option>
                        <option value="MARATHON">Marathon</option>
                        <option value="WALK">Marche</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de l'événement *
                      </label>
                      <input
                        type="datetime-local"
                        value={eventForm.eventDate}
                        onChange={(e) => setEventForm(prev => ({ ...prev, eventDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date limite d'inscription *
                      </label>
                      <input
                        type="datetime-local"
                        value={eventForm.registrationDeadline}
                        onChange={(e) => setEventForm(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre maximum de participants *
                      </label>
                      <input
                        type="number"
                        value={eventForm.maxParticipants}
                        onChange={(e) => setEventForm(prev => ({ ...prev, maxParticipants: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEventForm(false)}
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
                      {submitLoading ? 'Sauvegarde...' : editingEvent ? 'Modifier' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Registrations Modal */}
          {showRegistrationsModal && selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Inscriptions - {selectedEvent.name}
                    </h3>
                    <button
                      onClick={() => setShowRegistrationsModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {eventRegistrations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucune inscription pour cet événement
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nom</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date d'inscription</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {eventRegistrations.map((registration) => (
                            <tr key={registration.id}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {registration.participantName}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {registration.participantEmail}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {new Date(registration.registrationDate).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  registration.status === 'CONFIRMED' 
                                    ? 'bg-green-100 text-green-800' 
                                    : registration.status === 'CANCELLED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {registration.status === 'CONFIRMED' ? 'Confirmé' : 
                                   registration.status === 'CANCELLED' ? 'Annulé' : 'En attente'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;
