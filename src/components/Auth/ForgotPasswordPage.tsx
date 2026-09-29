import React from 'react';
import { ForgotPasswordCard } from './ForgotPasswordCard';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-black flex items-center justify-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-md">
        <ForgotPasswordCard
          onSuccess={() => navigate('/dashboard')}
          onBackToSignIn={() => navigate('/login')}
        />
      </div>
    </div>
  );
}
