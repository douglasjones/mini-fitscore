'use client';

import { createPortal } from 'react-dom';
import { ReactNode } from 'react';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

// Componente para exibir um modal de confirmação ou erro
const Modal = ({ children, onClose }: ModalProps) => {
  // Garante que o código só será executado no lado do cliente
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out opacity-100">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg transition-transform duration-300 ease-in-out transform scale-100">
        <div className="flex flex-col items-center text-center">
          {children}
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
