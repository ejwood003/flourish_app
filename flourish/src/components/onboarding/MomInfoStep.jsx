import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function MomInfoStep({ data, onNext, onBack }) {
    const [formData, setFormData] = useState({
        full_name: data.full_name || '',
        email: data.email || '',
        phone_number: data.phone_number || '',
        date_of_birth: data.date_of_birth || '',
        password: data.password || '',
        confirm_password: data.confirm_password || '',
    });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!formData.full_name || !formData.email || !formData.password) {
            setError('Please fill in name, email, and password.');
            return;
        }
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match.');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        onNext({
            full_name: formData.full_name,
            email: formData.email,
            phone_number: formData.phone_number,
            date_of_birth: formData.date_of_birth,
            password: formData.password,
        });
    };

    return (
        <div className="space-y-6">
            <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 text-[#5A4B70] hover:text-[#8B7A9F] transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
            </button>

            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-[#4A4458]">Your Information</h2>
                <p className="text-[#5A4B70]">Just the essentials</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
                {error && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
                )}
                <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-[#4A4458]">
                        Full Name
                    </Label>
                    <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Your name"
                        className="rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F]"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#4A4458]">
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F]"
                        required
                    />
                    <p className="text-xs text-[#7D7589]">You&apos;ll use this email to sign in.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mom-password" className="text-[#4A4458]">
                        Password
                    </Label>
                    <Input
                        id="mom-password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="At least 6 characters"
                        className="rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F]"
                        required
                        minLength={6}
                        autoComplete="new-password"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mom-confirm-password" className="text-[#4A4458]">
                        Confirm password
                    </Label>
                    <Input
                        id="mom-confirm-password"
                        type="password"
                        value={formData.confirm_password}
                        onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                        placeholder="Re-enter password"
                        className="rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F]"
                        required
                        autoComplete="new-password"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone_number" className="text-[#5A4B70]">
                        Phone Number <span className="text-xs">(Optional)</span>
                    </Label>
                    <Input
                        id="phone_number"
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F]"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date_of_birth" className="text-[#5A4B70]">
                        Date of Birth <span className="text-xs">(Optional)</span>
                    </Label>
                    <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F]"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 bg-[#7D6F99] hover:bg-[#7A6A8F] text-white rounded-2xl text-base mt-2"
                >
                    Continue
                </Button>
            </form>
        </div>
    );
}
