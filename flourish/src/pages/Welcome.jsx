import React from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_SHELL_MAX_WIDTH_CLASS, createPageUrl } from '@/utils';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/**
 * Public entry: first screen for signed-out users (see App.jsx).
 */
export default function Welcome() {
    useDocumentTitle('Welcome');
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FEF9F5] flex flex-col">
            <div className="flex-1 flex items-center justify-center px-4">
                <div className={`w-full ${APP_SHELL_MAX_WIDTH_CLASS}`}>
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
