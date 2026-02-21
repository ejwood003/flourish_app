    import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { ArrowLeft } from 'lucide-react';

    export default function SignInStep({ onSignIn, onBack }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSignIn({ email, password });
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
            <h1 className="text-3xl font-semibold text-[#4A4458]">Welcome Back</h1>
            <p className="text-lg text-[#7D7589]">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-[#4A4458] mb-2">Email</label>
            <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="rounded-xl"
                required
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-[#4A4458] mb-2">Password</label>
            <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="rounded-xl"
                required
            />
            </div>

            <Button
            type="submit"
            className="w-full h-12 bg-[#8B7A9F] hover:bg-[#7A6A8F] text-white rounded-2xl text-base mt-6"
            >
            Sign In
            </Button>
        </form>
        </div>
    );
    }