import React, { useMemo } from 'react';

function displayFullName(profile) {
    const first = profile?.user_first_name ?? profile?.userFirstName ?? '';
    const last = profile?.user_last_name ?? profile?.userLastName ?? '';
    const combined = [first, last].filter(Boolean).join(' ').trim();
    if (combined) return combined;
    const u = profile?.username ?? profile?.Username ?? '';
    return u ? String(u) : 'Member';
}

function displayEmail(profile) {
    return profile?.email ?? profile?.Email ?? '';
}

function displayBaby(profile) {
    return profile?.baby_full_name ?? profile?.babyFullName ?? '';
}

function initialFromName(name) {
    const s = String(name || '').trim();
    if (!s) return '?';
    return s.charAt(0).toUpperCase();
}

/**
 * Hero card (~1/4–1/3 viewport). Pink → lavender → soft blue (matches home / mindfulness gradients). No bubble shapes.
 */
export default function ProfileHeader({ profile }) {
    const fullName = useMemo(() => displayFullName(profile), [profile]);
    const email = useMemo(() => displayEmail(profile), [profile]);
    const babyName = useMemo(() => displayBaby(profile), [profile]);
    const initial = useMemo(() => initialFromName(fullName), [fullName]);

    return (
        <div
            className="relative overflow-hidden rounded-3xl shadow-lg ring-1 ring-[#E8E4F3]/90 mb-6 min-h-[20vh] max-h-[36vh] flex items-center px-6 py-7 sm:px-8 sm:py-9
                bg-gradient-to-br from-[#F5E6EA] via-[#E8E4F3] to-[#D9EEF2]"
        >
            <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/35 opacity-90"
                aria-hidden
            />
            <div className="relative flex items-center gap-5 sm:gap-6 w-full">
                <div
                    className="w-[3.75rem] h-[3.75rem] sm:w-[4.5rem] sm:h-[4.5rem] rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-md border border-white"
                    aria-hidden
                >
                    <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#7D6F99]">{initial}</span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 sm:gap-1.5">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#8B7A9F]/90">
                        Your profile
                    </p>
                    <h1 className="text-xl sm:text-2xl font-semibold text-[#4A4458] tracking-tight truncate leading-tight">
                        {fullName}
                    </h1>
                    {email ? (
                        <p className="text-sm text-[#5A4B70] truncate">{email}</p>
                    ) : (
                        <p className="text-sm text-[#7D7589]">Add your email in Personal Info</p>
                    )}
                    {babyName ? (
                        <span className="inline-flex mt-1 w-fit max-w-full items-center gap-1.5 rounded-full bg-white/85 border border-[#E8E4F3] px-3 py-1.5 text-xs sm:text-sm font-medium text-[#4A4458] shadow-sm truncate">
                            <span className="text-[#8B7A9F] font-semibold shrink-0">Baby</span>
                            <span className="truncate">{babyName}</span>
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
