import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal } from '../components/Modal';

const ModalContext = createContext({});

export const ModalProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    resolve: null
  });

  const confirm = useCallback((config) => {
    return new Promise((resolve) => {
      setModalConfig({
        isOpen: true,
        title: config.title || 'Tem certeza?',
        message: config.message || 'Esta ação não pode ser desfeita.',
        type: config.type || 'warning',
        resolve
      });
    });
  }, []);

  const handleClose = () => {
    if (modalConfig.resolve) modalConfig.resolve(false);
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    if (modalConfig.resolve) modalConfig.resolve(true);
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider value={{ confirm }}>
      {children}
      <Modal 
        isOpen={modalConfig.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
