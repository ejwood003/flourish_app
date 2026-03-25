import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import WelcomeStep from '@/components/onboarding/WelcomeStep';

/**
 * Public entry: first screen for signed-out users (see App.jsx).
 */
export default function Welcome() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FEF9F5] flex flex-col">
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-lg">
                    <WelcomeStep
                        onNext={() =>
                            navigate(createPageUrl('Onboarding'), {
                                state: { fromWelcome: true },
                            })
                        }
                        onSignIn={() =>
                            navigate(createPageUrl('Onboarding'), {
                                state: { fromWelcome: true, startAtSignIn: true },
                            })
                        }
                    />
                </div>
            </div>
        </div>
    );
}
