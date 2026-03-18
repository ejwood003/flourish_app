import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

export default function SupportAccountStep({ onNext, onBack, onVerify }) {
  const [motherEmail, setMotherEmail] = useState('');
  const [yourEmail, setYourEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    
    const verified = await onVerify(motherEmail, yourEmail);
    if (verified) {
      setIsVerified(true);
    } else {
      setError('Your email does not match the support email provided by the mother.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    onNext({ 
      motherEmail, 
      yourEmail, 
      password,
      accountType: 'support'
    });
  };

  return (
    <div className="space-y-8 py-12">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#7D7589] hover:text-[#8B7A9F] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold text-[#4A4458]">Connect as Support</h1>
        <p className="text-lg text-[#7D7589]">
          {!isVerified ? 'Verify your connection' : 'Set up your account'}
        </p>
      </div>

      {!isVerified ? (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="mother-email" className="block text-sm font-medium text-[#4A4458] mb-2">
              Mother's Email
            </label>
            <Input
              id="mother-email"
              name="mother-email"
              type="email"
              value={motherEmail}
              onChange={(e) => setMotherEmail(e.target.value)}
              placeholder="mother@email.com"
              className="rounded-xl"
              required
            />
          </div>

          <div>
            <label htmlFor="your-email" className="block text-sm font-medium text-[#4A4458] mb-2">
              Your Email
            </label>
            <Input
              id="your-email"
              name="your-email"
              type="email"
              value={yourEmail}
              onChange={(e) => setYourEmail(e.target.value)}
              placeholder="your@email.com"
              className="rounded-xl"
              required
            />
            <p className="text-xs text-[#7D7589] mt-1">
              This must match the support email the mother provided
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-[#8B7A9F] hover:bg-[#7A6A8F] text-white rounded-2xl text-base mt-6"
          >
            Verify Connection
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-700">✓ Connection verified!</p>
          </div>

          <div>
            <label htmlFor="create-password" className="block text-sm font-medium text-[#4A4458] mb-2">
              Create Password
            </label>
            <Input
              id="create-password"
              name="create-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="rounded-xl"
              required
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-[#4A4458] mb-2">
              Confirm Password
            </label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="rounded-xl"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-[#8B7A9F] hover:bg-[#7A6A8F] text-white rounded-2xl text-base mt-6"
          >
            Create Account
          </Button>
        </form>
      )}
    </div>
  );
}