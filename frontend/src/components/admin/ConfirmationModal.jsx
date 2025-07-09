import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmer l'action", 
  message, 
  confirmText = "Confirmer", 
  cancelText = "Annuler",
  type = "danger" // "danger", "warning", "info"
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          iconColor: "text-red-500",
          iconBg: "bg-red-100",
          confirmBg: "bg-red-600 hover:bg-red-700",
          borderColor: "border-red-200"
        };
      case "warning":
        return {
          iconColor: "text-yellow-500",
          iconBg: "bg-yellow-100",
          confirmBg: "bg-yellow-600 hover:bg-yellow-700",
          borderColor: "border-yellow-200"
        };
      default:
        return {
          iconColor: "text-blue-500",
          iconBg: "bg-blue-100",
          confirmBg: "bg-blue-600 hover:bg-blue-700",
          borderColor: "border-blue-200"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-full p-4">
        <div 
          className={`relative bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all ${styles.borderColor} border`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} mb-4`}>
              <FaExclamationTriangle className={`h-6 w-6 ${styles.iconColor}`} />
            </div>

            {/* Title */}
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              {title}
            </h3>

            {/* Message */}
            <p className="text-sm text-gray-500 text-center mb-6">
              {message}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${styles.confirmBg}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
