import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TermsAcceptanceModal from './TermsAcceptanceModal';
import { hasAcceptedTerms } from '../../services/termsAcceptanceService';

export const TERMS_DELAY_MS = 10_000;

const TermsAcceptanceGate: React.FC = () => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    setShowTerms(false);
    if (loading || !isAuthenticated || !currentUser?.id) return undefined;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const accepted = await hasAcceptedTerms(currentUser.id);
        if (!cancelled && !accepted) setShowTerms(true);
      } catch (error) {
        console.error('Erro ao verificar aceite dos termos:', error);
        if (!cancelled) setShowTerms(true);
      }
    }, TERMS_DELAY_MS);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [currentUser?.id, isAuthenticated, loading]);

  if (!showTerms || !currentUser?.id) return null;
  return <TermsAcceptanceModal userId={currentUser.id} onAccepted={() => setShowTerms(false)} />;
};

export default TermsAcceptanceGate;
