import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { User, Baby, Users, Trash2, ChevronDown, ChevronUp, Pencil, Check, Loader2 } from 'lucide-react';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';

function dateInputValue(v) {
    if (v == null || v === '') return '';
    const s = String(v);
    return s.length >= 10 ? s.slice(0, 10) : s;
}

function ProfileCard({ icon: Icon, title, subtitle, children, onSave, isSaving }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        try {
            await onSave();
            setSaved(true);
            setEditing(false);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            /* parent / mutation handles error; stay in edit mode */
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={() => {
                    setOpen((o) => !o);
                    if (!open) setEditing(false);
                }}
                className="w-full flex items-center justify-between p-5 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E8E4F3] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#8B7A9F]" />
                    </div>
                    <div>
                        <p className="font-semibold text-[#4A4458]">{title}</p>
                        {subtitle ? (
                            <p className="text-xs text-[#7D7589] mt-0.5">{subtitle}</p>
                        ) : null}
                    </div>
                </div>
                {open ? (
                    <ChevronUp className="w-4 h-4 text-[#7D7589]" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-[#7D7589]" />
                )}
            </button>

            {open ? (
                <div className="border-t border-[#F5EEF8]">
                    <div className="px-5 pt-4 pb-2 space-y-4">{children(editing)}</div>
                    <div className="flex items-center justify-end gap-2 px-5 pb-4 pt-2">
                        {!editing ? (
                            <button
                                type="button"
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-1.5 text-sm font-medium text-[#8B7A9F] hover:text-[#7A6A8E] bg-[#F5EEF8] hover:bg-[#EDE5F5] px-4 py-2 rounded-xl transition-colors"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className="text-sm text-[#7D7589] hover:text-[#4A4458] px-4 py-2 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#8B7A9F] hover:bg-[#7A6A8E] px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Check className="w-3.5 h-3.5" />
                                    )}
                                    {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function Field({ label, children, hint }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#7D7589] uppercase tracking-wide">{label}</label>
            {children}
            {hint ? <p className="text-xs text-[#7D7589] mt-1">{hint}</p> : null}
        </div>
    );
}

const inputClass = 'border-[#E8E4F3] focus:border-[#8B7A9F] rounded-xl bg-[#FDFBFF]';
const disabledClass = 'bg-[#F5EEF8]/40 border-[#E8E4F3] text-[#7D7589] rounded-xl';

function displayFullName(profile) {
    const first = profile?.user_first_name ?? profile?.userFirstName ?? '';
    const last = profile?.user_last_name ?? profile?.userLastName ?? '';
    return [first, last].filter(Boolean).join(' ').trim();
}

function displayEmail(profile) {
    return profile?.email ?? '';
}

/** Backend default on UserProfile.SupportName — not a real entered contact on its own. */
const DEFAULT_SUPPORT_NAME = 'your partner';

function isPlaceholderSupportName(name) {
    const n = String(name ?? '').trim().toLowerCase();
    return n === '' || n === DEFAULT_SUPPORT_NAME;
}

/** True when the user has entered something beyond the seeded placeholder name. */
function hasMeaningfulSupport(s) {
    const email = String(s.support_email ?? '').trim();
    const phone = String(s.support_phone ?? '').trim();
    const type = String(s.support_type ?? '').trim();
    const name = s.support_name;
    if (email || phone) return true;
    if (type) return true;
    if (!isPlaceholderSupportName(name)) return true;
    return false;
}

/**
 * @param {object} props
 * @param {object} props.profile — UserProfile row from REST (snake_case or camelCase keys)
 * @param {function} props.onSavePatch — async (partial: Record<string, unknown>) => void; persists via PATCH UserProfile
 * @param {boolean} props.isSaving
 */
export default function PersonalInfoSection({ profile, onSavePatch, isSaving }) {
    const [localPersonal, setLocalPersonal] = useState({});
    const [localBaby, setLocalBaby] = useState({});
    const [localSupport, setLocalSupport] = useState({});
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);

    const profileKey = profile?.user_id ?? profile?.userId ?? profile?.id ?? '';

    const syncFromProfile = useCallback(() => {
        setLocalPersonal({
            username: profile?.username ?? '',
            date_of_birth: dateInputValue(profile?.date_of_birth ?? profile?.dateOfBirth),
            phone_number: profile?.phone_number ?? profile?.phoneNumber ?? '',
        });
        setLocalBaby({
            baby_full_name: profile?.baby_full_name ?? profile?.babyFullName ?? '',
            baby_date_of_birth: dateInputValue(profile?.baby_date_of_birth ?? profile?.babyDateOfBirth),
            baby_gender: profile?.baby_gender ?? profile?.babyGender ?? '',
        });
        setLocalSupport({
            support_type: profile?.support_type ?? profile?.supportType ?? '',
            support_name: profile?.support_name ?? profile?.supportName ?? '',
            support_email: profile?.support_email ?? profile?.supportEmail ?? '',
            support_phone: profile?.support_phone ?? profile?.supportPhone ?? '',
        });
    }, [profile]);

    useEffect(() => {
        syncFromProfile();
    }, [profileKey, syncFromProfile]);

    const save = async (data) => {
        await onSavePatch(data);
    };

    const hasSupport = hasMeaningfulSupport(localSupport);

    const fullName = displayFullName(profile);
    const email = displayEmail(profile);

    return (
        <div className="space-y-6">
            <ProfileCard
                icon={User}
                title="Personal Info"
                subtitle="Your account details"
                onSave={() => save(localPersonal)}
                isSaving={isSaving}
            >
                {(editing) => (
                    <>
                        <Field label="Full Name">
                            <Input value={fullName} disabled className={disabledClass} />
                        </Field>
                        <Field label="Email">
                            <Input value={email} disabled className={disabledClass} />
                        </Field>
                        <Field label="Username">
                            <Input
                                value={localPersonal.username}
                                onChange={(e) =>
                                    setLocalPersonal((p) => ({ ...p, username: e.target.value }))
                                }
                                placeholder="Choose a username"
                                disabled={!editing}
                                className={editing ? inputClass : disabledClass}
                            />
                        </Field>
                        <Field label="Date of Birth">
                            <Input
                                type="date"
                                value={localPersonal.date_of_birth}
                                onChange={(e) =>
                                    setLocalPersonal((p) => ({ ...p, date_of_birth: e.target.value }))
                                }
                                disabled={!editing}
                                className={editing ? inputClass : disabledClass}
                            />
                        </Field>
                        <Field label="Phone Number">
                            <Input
                                type="tel"
                                value={localPersonal.phone_number}
                                onChange={(e) =>
                                    setLocalPersonal((p) => ({ ...p, phone_number: e.target.value }))
                                }
                                placeholder="+1 (555) 000-0000"
                                disabled={!editing}
                                className={editing ? inputClass : disabledClass}
                            />
                        </Field>
                    </>
                )}
            </ProfileCard>

            <ProfileCard
                icon={Baby}
                title="Baby Info"
                subtitle={
                    localBaby.baby_full_name ||
                    profile?.baby_full_name ||
                    profile?.babyFullName ||
                    "Your little one's details"
                }
                onSave={() => save(localBaby)}
                isSaving={isSaving}
            >
                {(editing) => (
                    <>
                        <Field label="Baby's Name">
                            <Input
                                value={localBaby.baby_full_name}
                                onChange={(e) =>
                                    setLocalBaby((p) => ({ ...p, baby_full_name: e.target.value }))
                                }
                                placeholder="Enter baby's name"
                                disabled={!editing}
                                className={editing ? inputClass : disabledClass}
                            />
                        </Field>
                        <Field label="Date of Birth">
                            <Input
                                type="date"
                                value={localBaby.baby_date_of_birth}
                                onChange={(e) =>
                                    setLocalBaby((p) => ({ ...p, baby_date_of_birth: e.target.value }))
                                }
                                disabled={!editing}
                                className={editing ? inputClass : disabledClass}
                            />
                        </Field>
                        <Field label="Gender">
                            {editing ? (
                                <Select
                                    value={localBaby.baby_gender || undefined}
                                    onValueChange={(v) => setLocalBaby((p) => ({ ...p, baby_gender: v }))}
                                >
                                    <SelectTrigger className={inputClass}>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="boy">Boy</SelectItem>
                                        <SelectItem value="girl">Girl</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    value={
                                        localBaby.baby_gender
                                            ? String(localBaby.baby_gender).replace(/_/g, ' ')
                                            : ''
                                    }
                                    disabled
                                    className={disabledClass}
                                    placeholder="Not set"
                                />
                            )}
                        </Field>
                    </>
                )}
            </ProfileCard>

            <ProfileCard
                icon={Users}
                title="Support Person"
                subtitle={
                    hasSupport
                        ? (!isPlaceholderSupportName(localSupport.support_name)
                              ? localSupport.support_name
                              : null) ||
                          localSupport.support_email ||
                          'Support'
                        : 'Add someone to help you'
                }
                onSave={() => save(localSupport)}
                isSaving={isSaving}
            >
                {(editing) => (
                    <>
                        <Field label="Relationship">
                            {editing ? (
                                <Select
                                    value={localSupport.support_type || undefined}
                                    onValueChange={(v) =>
                                        setLocalSupport((p) => ({ ...p, support_type: v }))
                                    }
                                >
                                    <SelectTrigger className={inputClass}>
                                        <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="partner">Partner</SelectItem>
                                        <SelectItem value="nanny">Nanny</SelectItem>
                                        <SelectItem value="mother">Mother</SelectItem>
                                        <SelectItem value="friend">Friend</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    value={localSupport.support_type || ''}
                                    disabled
                                    className={disabledClass}
                                    placeholder="Not set"
                                />
                            )}
                        </Field>
                        <Field label="Name">
                            <Input
                                value={localSupport.support_name}
                                onChange={(e) =>
                                    setLocalSupport((p) => ({ ...p, support_name: e.target.value }))
                                }
                                placeholder="Their name"
                                disabled={!editing}
                                className={editing ? inputClass : disabledClass}
                            />
                        </Field>
                        <Field label="Email">
                            <Input
                                type="email"
                                value={localSupport.support_email}
                                onChange={(e) =>
                                    setLocalSupport((p) => ({ ...p, support_email: e.target.value }))
                                }
                                placeholder="their@email.com"
                                disabled={!editing}
                                className={editing ? inputClass : disabledClass}
                            />
                        </Field>
                        <Field label="Phone (optional)">
                            <Input
                                type="tel"
                                value={localSupport.support_phone}
                                onChange={(e) =>
                                    setLocalSupport((p) => ({ ...p, support_phone: e.target.value }))
                                }
                                placeholder="+1 (555) 000-0000"
                                disabled={!editing}
                                className={editing ? inputClass : disabledClass}
                            />
                        </Field>
                        {editing && hasSupport ? (
                            <button
                                type="button"
                                onClick={() => setShowRemoveDialog(true)}
                                className="flex items-center gap-2 text-sm text-[#8B4A4A] hover:text-[#7A4040] transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Remove support person
                            </button>
                        ) : null}
                    </>
                )}
            </ProfileCard>

            <DeleteConfirmationDialog
                open={showRemoveDialog}
                onOpenChange={setShowRemoveDialog}
                onConfirm={async () => {
                    const cleared = {
                        support_type: '',
                        support_name: '',
                        support_email: '',
                        support_phone: '',
                    };
                    await save(cleared);
                    setLocalSupport({
                        support_type: '',
                        support_name: '',
                        support_email: '',
                        support_phone: '',
                    });
                    setShowRemoveDialog(false);
                }}
                title="Remove support person?"
                description="This will clear all support person information from your profile."
            />
        </div>
    );
}
