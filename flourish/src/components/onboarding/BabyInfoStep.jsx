import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Baby, ArrowLeft } from 'lucide-react';

export default function BabyInfoStep({ data, onNext, onSkip, onBack }) {
    const [formData, setFormData] = useState({
        baby_full_name: data.baby_full_name || '',
        baby_date_of_birth: data.baby_date_of_birth || '',
        baby_gender: data.baby_gender || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onNext(formData);
    };

    const genderOptions = [
        { value: 'boy', label: 'Boy' },
        { value: 'girl', label: 'Girl' },
        { value: 'other', label: 'Other' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ];

    return (
        <div className="space-y-6">
        <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#5A4B70] hover:text-[#8B7A9F] transition-colors"
        >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
        </button>

        <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-[#F5E6EA] flex items-center justify-center">
                <Baby className="w-7 h-7 text-[#8B7A9F]" />
            </div>
            </div>
            <h2 className="text-2xl font-semibold text-[#4A4458]">Tell us about your baby</h2>
            <p className="text-[#5A4B70]">This helps us personalize your experience</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
            <div className="space-y-2">
            <Label htmlFor="baby_full_name" className="text-[#4A4458]">Baby's Full Name</Label>
            <Input
                id="baby_full_name"
                value={formData.baby_full_name}
                onChange={(e) => setFormData({ ...formData, baby_full_name: e.target.value })}
                placeholder="Baby's name"
                className="rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F]"
            />
            </div>

            <div className="space-y-2">
            <Label htmlFor="baby_date_of_birth" className="text-[#4A4458]">Date of Birth</Label>
            <Input
                id="baby_date_of_birth"
                type="date"
                value={formData.baby_date_of_birth}
                onChange={(e) => setFormData({ ...formData, baby_date_of_birth: e.target.value })}
                className="rounded-xl border-[#E8E4F3] focus:border-[#8B7A9F]"
            />
            </div>

            <div className="space-y-2">
            <Label className="text-[#4A4458]">Gender</Label>
            <div className="grid grid-cols-2 gap-2">
                {genderOptions.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, baby_gender: option.value })}
                    className={`py-3 px-4 rounded-xl border-2 transition-all text-sm ${
                    formData.baby_gender === option.value
                        ? 'border-[#8B7A9F] bg-[#F5EEF8] text-[#7D6F99]'
                        : 'border-[#E8E4F3] text-[#7D6F99] hover:border-[#D9D4E3]'
                    }`}
                >
                    {option.label}
                </button>
                ))}
            </div>
            </div>

            <div className="space-y-2 pt-2">
            <Button
                type="submit"
                className="w-full h-12 bg-[#7D6F99] hover:bg-[#7A6A8F] text-white rounded-2xl text-base"
            >
                Continue
            </Button>
            
            <Button
                type="button"
                onClick={() => onSkip({ skipBaby: true })}
                variant="ghost"
                className="w-full text-[#5A4B70] hover:text-[#7D6F99] hover:bg-transparent"
            >
                Add later
            </Button>
            </div>
        </form>
        </div>
    );
    }