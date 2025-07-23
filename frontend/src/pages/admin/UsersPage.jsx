import React, { useState, useEffect } from 'react';
import { FaUsers, FaEdit, FaTrash, FaPlus, FaSearch, FaUserShield, FaUser } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/admin/sidebar';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import { userService } from '../../services/userService';

const UsersPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Check for success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      // Clear the state to prevent message from showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedUsers = await userService.getAllUsers(searchTerm, filterRole);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm, filterRole]);

  // Filter users based on search term and role (client-side filtering for immediate response)
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Extract role from user.role string ("ADMIN" or "USER")
    const userRole = user.role ;
    
    const matchesRole = filterRole === 'all' || userRole === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const handleEditUser = (userId) => {
    navigate(`/admin/users/edit/${userId}`);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await userService.deleteUser(userToDelete.id);
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setSuccessMessage(`Utilisateur ${userToDelete.username} supprimé avec succès`);
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression de l\'utilisateur');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleAddUser = () => {
    navigate('/admin/users/add');
  };

  const getRoleBadge = (user) => {
    const isAdmin = user.role === 'ADMIN';
    
    return (
      <span 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isAdmin 
            ? 'text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}
        style={{ backgroundColor: isAdmin ? '#00ACA8' : undefined }}
      >
        {isAdmin ? <FaUserShield size={10} className="mr-1" /> : <FaUser size={10} className="mr-1" />}
        {isAdmin ? 'Administrateur' : 'Utilisateur'}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className={`flex-1 p-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <div className="mb-8">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">✅ {successMessage}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des Utilisateurs
              </h1>
              <p className="text-gray-600">
                Gérez tous les utilisateurs enregistrés sur la plateforme
              </p>
            </div>
            
            {/* Add User Button */}
            <button
              onClick={handleAddUser}
              className="flex items-center px-4 py-2 rounded-lg text-white font-medium hover:shadow-md transition-all duration-200"
              style={{ backgroundColor: '#00ACA8' }}
            >
              <FaPlus size={16} className="mr-2" />
              Ajouter Utilisateur
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou nom d'utilisateur..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:border-blue-500"
                  style={{ focusRingColor: '#00ACA8', focusBorderColor: '#00ACA8' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <div className="md:w-48">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1"
                  style={{ focusRingColor: '#00ACA8', focusBorderColor: '#00ACA8' }}
                >
                  <option value="all">Tous les rôles</option>
                  <option value="USER">Utilisateurs</option>
                  <option value="ADMIN">Administrateurs</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Liste des Utilisateurs
              </h3>
              <span className="text-sm text-gray-500">
                {filteredUsers.length} utilisateur(s) trouvé(s)
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" 
                   style={{ borderColor: '#00ACA8' }}>
              </div>
              <p className="text-gray-500">Chargement des utilisateurs...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'inscription
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName || ''} {user.lastName || ''}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="p-2 rounded-lg text-gray-600 hover:text-white hover:shadow-md transition-all duration-200"
                            style={{ ':hover': { backgroundColor: '#00ACA8' } }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#00ACA8';
                              e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#6B7280';
                            }}
                            title="Éditer"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-red-500 hover:text-white hover:shadow-md transition-all duration-200"
                            title="Supprimer"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && !loading && (
                <div className="p-8 text-center">
                  <FaUsers size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun utilisateur trouvé
                  </h3>
                  <p className="text-gray-500">
                    Essayez de modifier vos critères de recherche ou d'ajouter un nouvel utilisateur.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteUser}
        onConfirm={confirmDeleteUser}
        title="Supprimer l'utilisateur"
        message={
          userToDelete ? 
          `Êtes-vous sûr de vouloir supprimer l'utilisateur "${userToDelete.username}" ? Cette action est irréversible.` :
          "Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
        }
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
};

export default UsersPage;