import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import UserSidebar from '../../components/user/UserSidebar';
import { FaUser, FaEdit, FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('view');
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await userService.getCurrentUserProfile();
        setUser(userData);
        setEditForm({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || ''
        });
      } catch (err) {
        setError(err.message || 'Erreur lors de la récupération du profil.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const updatedUser = await userService.updateCurrentUserProfile(editForm);
      setUser(updatedUser);
      setSuccessMessage('Profil mis à jour avec succès!');
      setActiveTab('view');
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError('');
    setSuccessMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      setPasswordLoading(false);
      return;
    }

    try {
      await userService.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setSuccessMessage('Mot de passe modifié avec succès!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setActiveTab('view');
    } catch (err) {
      setError(err.message || 'Erreur lors de la modification du mot de passe.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <div className="flex-1 p-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-12 mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#00ACA8' }}>
              Mon Profil
            </h1>
            <p className="text-lg text-gray-600">Gérez vos informations personnelles et votre sécurité</p>
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

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-12 px-12">
                <button
                  onClick={() => setActiveTab('view')}
                  className={`py-5 px-2 border-b-2 font-semibold text-base ${
                    activeTab === 'view'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={activeTab === 'view' ? { borderColor: '#00ACA8', color: '#00ACA8' } : {}}
                >
                  <FaUser className="inline mr-2" />
                  Afficher le profil
                </button>
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`py-5 px-2 border-b-2 font-semibold text-base ${
                    activeTab === 'edit'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={activeTab === 'edit' ? { borderColor: '#00ACA8', color: '#00ACA8' } : {}}
                >
                  <FaEdit className="inline mr-2" />
                  Modifier le profil
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`py-5 px-2 border-b-2 font-semibold text-base ${
                    activeTab === 'password'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={activeTab === 'password' ? { borderColor: '#00ACA8', color: '#00ACA8' } : {}}
                >
                  <FaLock className="inline mr-2" />
                  Changer le mot de passe
                </button>
              </nav>
            </div>

            <div className="p-12">
              {loading ? (
                <div className="text-center text-gray-500 py-12 text-xl">
                  Chargement du profil...
                </div>
              ) : !user ? (
                <div className="text-center text-red-500 py-12 text-xl">
                  Impossible de charger le profil
                </div>
              ) : (
                <>
                  {/* View Profile Tab */}
                  {activeTab === 'view' && (
                    <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <div>
                            <label className="block text-base font-semibold text-gray-700 mb-2">
                              Nom d'utilisateur
                            </label>
                            <div className="bg-gray-50 p-4 rounded-lg text-lg">
                              @{user.username}
                            </div>
                          </div>
                          <div>
                            <label className="block text-base font-semibold text-gray-700 mb-2">
                              Prénom
                            </label>
                            <div className="bg-gray-50 p-4 rounded-lg text-lg">
                              {user.firstName || 'Non renseigné'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-base font-semibold text-gray-700 mb-2">
                              Nom de famille
                            </label>
                            <div className="bg-gray-50 p-4 rounded-lg text-lg">
                              {user.lastName || 'Non renseigné'}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-base font-semibold text-gray-700 mb-2">
                              Email
                            </label>
                            <div className="bg-gray-50 p-4 rounded-lg text-lg">
                              {user.email}
                            </div>
                          </div>
                          <div>
                            <label className="block text-base font-semibold text-gray-700 mb-2">
                              Rôle
                            </label>
                            <div className="bg-gray-50 p-4 rounded-lg text-lg">
                              <span 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: '#00ACA8' }}
                              >
                                {user.role || 'USER'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-base font-semibold text-gray-700 mb-2">
                              Date d'inscription
                            </label>
                            <div className="bg-gray-50 p-4 rounded-lg text-lg">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Edit Profile Tab */}
                  {activeTab === 'edit' && (
                    <form onSubmit={handleEditSubmit} className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-3">
                            Prénom
                          </label>
                          <input
                            type="text"
                            value={editForm.firstName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                            style={{ '--tw-ring-color': '#00ACA8' }}
                          />
                        </div>
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-3">
                            Nom de famille
                          </label>
                          <input
                            type="text"
                            value={editForm.lastName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                            style={{ '--tw-ring-color': '#00ACA8' }}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-base font-semibold text-gray-700 mb-3">
                            Email
                          </label>
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                            style={{ '--tw-ring-color': '#00ACA8' }}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-4 mt-4">
                        <button
                          type="button"
                          onClick={() => setActiveTab('view')}
                          className="px-6 py-3 text-lg text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={updateLoading}
                          className="px-8 py-3 text-lg text-white rounded-lg transition-colors disabled:opacity-50"
                          style={{ backgroundColor: '#00ACA8' }}
                        >
                          {updateLoading ? 'Mise à jour...' : 'Enregistrer'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Change Password Tab */}
                  {activeTab === 'password' && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-10">
                      <div className="max-w-lg space-y-6">
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-3">
                            Ancien mot de passe
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.old ? 'text' : 'password'}
                              value={passwordForm.oldPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                              style={{ '--tw-ring-color': '#00ACA8' }}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('old')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.old ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-3">
                            Nouveau mot de passe
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                              style={{ '--tw-ring-color': '#00ACA8' }}
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('new')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-3">
                            Confirmer le nouveau mot de passe
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                              style={{ '--tw-ring-color': '#00ACA8' }}
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('confirm')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-4 mt-4">
                        <button
                          type="button"
                          onClick={() => setActiveTab('view')}
                          className="px-6 py-3 text-lg text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="px-8 py-3 text-lg text-white rounded-lg transition-colors disabled:opacity-50"
                          style={{ backgroundColor: '#00ACA8' }}
                        >
                          {passwordLoading ? 'Modification...' : 'Changer le mot de passe'}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
