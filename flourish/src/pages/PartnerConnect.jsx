    import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { createPageUrl } from '@/utils';
    import { createUserProfile } from '@/api/userProfileApi';
    import { setAuth } from '@/lib/auth';
    import { ArrowLeft, Link2, Loader2 } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useMutation } from '@tanstack/react-query';

    export default function PartnerConnect() {
    const navigate = useNavigate();
    const [partnerCode, setPartnerCode] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [supportType, setSupportType] = useState('partner');
    const [error, setError] = useState('');

    const connectMutation = useMutation({
        mutationFn: async () => {
        // Create a partner profile
        const profileData = {
            support_type: supportType,
            support_name: partnerName,
            partner_code: partnerCode,
            is_support_account: true,
        };
        
        return await createUserProfile({
            username: `${partnerCode}@partner.flourish`,
            email: `${partnerCode}@partner.flourish`,
            password: `connect_${partnerCode}`,
            user_first_name: partnerName,
            user_last_name: '',
            support_type: supportType,
            support_name: partnerName,
            created_by: partnerCode,
        });
        },
        onSuccess: (data) => {
        const uid = data?.user_id ?? data?.userId;
        setAuth('mother', uid);
        navigate(createPageUrl('PartnerHome'));
        },
        onError: (error) => {
        setError('Failed to connect. Please check the partner code and try again.');
        },
    });

    const handleConnect = (e) => {
        e.preventDefault();
        setError('');
        
        if (!partnerCode || !partnerName) {
        setError('Please fill in all required fields');
        return;
        }
        
        connectMutation.mutate();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FEF9F5] via-[#F5EEF8] to-[#E8E4F3] flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
            {/* Back Button */}
            <button
                onClick={() => navigate(createPageUrl('Welcome'))}
                className="mb-6 text-[#8B7A9F] hover:text-[#7A6A8E] transition-colors flex items-center gap-2"
            >
                <ArrowLeft className="w-5 h-5" />
                Back
            </button>

            {/* Header */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#EDD9E8] to-[#F5E6EA] mx-auto mb-4">
                <Link2 className="w-8 h-8 text-[#8B7A9F]" />
                </div>
                <h1 className="text-2xl font-bold text-[#4A4458] text-center mb-2">
                Connect as Support Partner
                </h1>
                <p className="text-[#7D7589] text-center mb-6">
                Enter the partner code to connect to an existing account
                </p>

                {/* Form */}
                <form onSubmit={handleConnect} className="space-y-4">
                {/* Partner Code */}
                <div>
                    <Label htmlFor="partnerCode" className="text-[#4A4458] mb-2">
                    Partner Code *
                    </Label>
                    <Input
                    id="partnerCode"
                    type="text"
                    placeholder="Enter partner code"
                    value={partnerCode}
                    onChange={(e) => setPartnerCode(e.target.value)}
                    className="rounded-xl border-[#E8E4F3]"
                    required
                    />
                    <p className="text-xs text-[#7D7589] mt-1">
                    Ask the account holder for their partner code
                    </p>
                </div>

                {/* Your Name */}
                <div>
                    <Label htmlFor="partnerName" className="text-[#4A4458] mb-2">
                    Your Name *
                    </Label>
                    <Input
                    id="partnerName"
                    type="text"
                    placeholder="Enter your name"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="rounded-xl border-[#E8E4F3]"
                    required
                    />
                </div>

                {/* Support Type */}
                <div>
                    <Label className="text-[#4A4458] mb-2">Your Relationship</Label>
                    <div className="grid grid-cols-2 gap-2">
                    {[
                        { value: 'partner', label: 'Partner' },
                        { value: 'mother', label: 'Mother' },
                        { value: 'friend', label: 'Friend' },
                        { value: 'other', label: 'Other' },
                    ].map((type) => (
                        <button
                        key={type.value}
                        type="button"
                        onClick={() => setSupportType(type.value)}
                        className={`py-3 rounded-xl font-medium transition-all ${
                            supportType === type.value
                            ? 'bg-[#8B7A9F] text-white'
                            : 'bg-[#E8E4F3] text-[#7D7589] hover:bg-[#DDD8EB]'
                        }`}
                        >
                        {type.label}
                        </button>
                    ))}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Connect Button */}
                <Button
                    type="submit"
                    disabled={connectMutation.isPending}
                    className="w-full bg-[#8B7A9F] hover:bg-[#7A6A8E] text-white rounded-xl py-6 text-base font-medium"
                >
                    {connectMutation.isPending ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Connecting...
                    </>
                    ) : (
                    'Connect to Account'
                    )}
                </Button>
                </form>
            </div>
            </div>
        </div>
        </div>
    );
    }