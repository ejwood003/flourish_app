import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

export default function SignInStep({ onSignIn, onBack }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSignIn({ username, password });
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

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
            <div className="space-y-2">
            <Label htmlFor="username" className="text-[#4A4458]">Email</Label>
            <Input
                id="username"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your@email.com"
                className="rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F]"
                required
            />
            </div>

            <div className="space-y-2">
            <Label htmlFor="signin-password" className="text-[#4A4458]">Password</Label>
            <Input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F]"
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