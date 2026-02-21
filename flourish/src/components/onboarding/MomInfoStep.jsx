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
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.full_name && formData.email) {
        onNext(formData);
        }
    };

    return (
        <div className="space-y-6">
        <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#7D7589] hover:text-[#8B7A9F] transition-colors"
        >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
        </button>

        <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-[#4A4458]">Your Information</h2>
            <p className="text-[#7D7589]">Just the essentials</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
            <div className="space-y-2">
            <Label htmlFor="full_name" className="text-[#4A4458]">Full Name</Label>
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
            <Label htmlFor="email" className="text-[#4A4458]">Email</Label>
            <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F]"
                required
            />
            </div>

            <div className="space-y-2">
            <Label htmlFor="phone_number" className="text-[#7D7589]">
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
            <Label htmlFor="date_of_birth" className="text-[#7D7589]">
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
            className="w-full h-12 bg-[#8B7A9F] hover:bg-[#7A6A8F] text-white rounded-2xl text-base mt-2"
            >
            Continue
            </Button>
        </form>
        </div>
    );
    }