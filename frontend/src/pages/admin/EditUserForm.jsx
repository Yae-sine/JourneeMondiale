import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import AdminSidebar from '../../components/admin/sidebar';
import { userService } from '../../services/userService';

const EditUserForm = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: 'USER',
    createdAt: null,
    updatedAt: null
  });

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const user = await userService.getUserById(id);
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          username: user.username || '',
          email: user.email || '',
          role: user.role || 'USER',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Erreur lors du chargement des données utilisateur');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || 
        !formData.username.trim() || !formData.email.trim()) {
      setError('Tous les champs sont requis');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      await userService.updateUser(id, formData);
      
      // Navigate back to users page with success message
      navigate('/admin/users', { 
        state: { 
          message: 'Utilisateur modifié avec succès',
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Erreur lors de la mise à jour de l\'utilisateur');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate('/admin/users');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        <div className={`flex-1 p-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
                 style={{ borderColor: '#00ACA8' }}>
            </div>
            <p className="text-gray-500">Chargement des données utilisateur...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-8 flex flex-col items-center">
        {/* Header */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={handleCancel}
                className="mr-4 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                title="Retour"
              >
                <FaArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Modifier l'Utilisateur
                </h1>
                <p className="text-gray-600">
                  Modifiez les informations de l'utilisateur
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
          <div className="flex items-center mb-6">
            <FaUser className="text-2xl mr-3" style={{ color: '#00ACA8' }} />
            <h2 className="text-xl font-semibold text-gray-900">
              Informations Utilisateur
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: '#00ACA8' }}
                placeholder="Entrez le prénom"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: '#00ACA8' }}
                placeholder="Entrez le nom"
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                maxLength={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: '#00ACA8' }}
                placeholder="Entrez le nom d'utilisateur"
              />
              <p className="mt-1 text-sm text-gray-500">Maximum 20 caractères</p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: '#00ACA8' }}
                placeholder="Entrez l'adresse email"
              />
              <p className="mt-1 text-sm text-gray-500">Maximum 50 caractères</p>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Rôle *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: '#00ACA8' }}
              >
                <option value="USER">Utilisateur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Sélectionnez le rôle approprié pour cet utilisateur
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                <FaTimes size={14} className="mr-2 inline" />
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-md text-white font-medium hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#00ACA8',
                  focusRingColor: '#00ACA8'
                }}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <FaSave size={14} className="mr-2 inline" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Read-only Information */}
          {(formData.createdAt || formData.updatedAt) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Informations de Suivi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Date de création
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(formData.createdAt).toLocaleString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
                {formData.updatedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Dernière modification
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(formData.updatedAt).toLocaleString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditUserForm;
