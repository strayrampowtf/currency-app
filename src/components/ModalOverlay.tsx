import React from 'react';
import styles from './ModalOverlay.module.css';

interface ModalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalOverlay = ({ isOpen, onClose, children }: ModalOverlayProps) => {
  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.active : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.modal} ${isOpen ? styles.active : ''}`}>
        {children}
      </div>
    </>
  );
};

export default ModalOverlay;