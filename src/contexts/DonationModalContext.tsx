import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface DonationModalContextType {
  isOpen: boolean;
  initialAmount?: number;
  openModal: (amount?: number) => void;
  closeModal: () => void;
}

const DonationModalContext = createContext<DonationModalContextType | undefined>(undefined);

export const DonationModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialAmount, setInitialAmount] = useState<number | undefined>(undefined);

  const openModal = useCallback((amount?: number) => {
    setInitialAmount(amount);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setInitialAmount(undefined);
  }, []);

  return (
    <DonationModalContext.Provider value={{ isOpen, initialAmount, openModal, closeModal }}>
      {children}
    </DonationModalContext.Provider>
  );
};

export const useDonationModal = () => {
  const context = useContext(DonationModalContext);
  if (!context) {
    throw new Error('useDonationModal must be used within DonationModalProvider');
  }
  return context;
};
