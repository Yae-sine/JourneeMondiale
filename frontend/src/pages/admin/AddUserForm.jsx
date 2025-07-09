import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaArrowLeft, FaSave, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import AdminSidebar from '../../components/admin/sidebar';
import { userService } from '../../services/userService';

const AddUserForm = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    role: 'USER'
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate a random password
  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || 
        !formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Tous les champs sont requis');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      await userService.createUser(formData);
      
      // Navigate back to users page with success message
      navigate('/admin/users', { 
        state: { 
          message: `Utilisateur ${formData.username} créé avec succès`,
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Erreur lors de la création de l\'utilisateur. L\'email ou le nom d\'utilisateur existe peut-être déjà.');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate('/admin/users');
  };

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
                  Ajouter un Utilisateur
                </h1>
                <p className="text-gray-600">
                  Créez un nouveau compte utilisateur
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ focusRingColor: '#00ACA8' }}
                  placeholder="Entrez le mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-sm text-gray-500">Minimum 6 caractères</p>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-sm px-2 py-1 rounded text-white hover:shadow-sm transition-all"
                  style={{ backgroundColor: '#00ACA8' }}
                >
                  Générer automatiquement
                </button>
              </div>
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
                    Création...
                  </>
                ) : (
                  <>
                    <FaSave size={14} className="mr-2 inline" />
                    Créer l'utilisateur
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Password Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              💡 Conseil de sécurité
            </h4>
            <p className="text-sm text-blue-700">
              Assurez-vous de communiquer le mot de passe de manière sécurisée à l'utilisateur. 
              Il est recommandé de demander à l'utilisateur de changer son mot de passe lors de sa première connexion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserForm;
