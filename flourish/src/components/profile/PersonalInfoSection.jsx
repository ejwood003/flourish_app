import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { User, Baby, Users, Trash2, Loader2, Check } from 'lucide-react';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';

export default function PersonalInfoSection({
  profile,
  user,
  onUpdate,
  onSave,
  isSaving,
  saveSuccess,
}) {
const [showRemoveDialog, setShowRemoveDialog] = useState(false);

const handleRemoveSupport = () => {
  onUpdate({
    support_type: '',
    support_name: '',
    support_email: '',
    support_phone: ''
  });
  setShowRemoveDialog(false);
};

const hasSupport = profile?.support_name || profile?.support_email;

return (
  <div className="space-y-6">
    {/* Personal */}
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-[#8B7A9F]" />
        <h3 className="text-lg font-semibold text-[#4A4458]">Personal</h3>
      </div>
      
      <div className="space-y-4">
        <div>
        <Label className="text-sm text-[#5A4B70] mb-1.5">Full Name</Label>
        <Input 
            value={user?.full_name || ''} 
            disabled
            className="bg-[#F5EEF8]/50 border-[#E8E4F3]"
          />
        </div>
        
        <div>
        <Label className="text-sm text-[#5A4B70] mb-1.5">Email</Label>
        <Input 
            value={user?.email || ''} 
            disabled
            className="bg-[#F5EEF8]/50 border-[#E8E4F3]"
          />
        </div>
        
        <div>
        <Label className="text-sm text-[#5A4B70] mb-1.5">Username</Label>
        <Input 
            value={profile?.username || ''} 
            onChange={(e) => onUpdate({ username: e.target.value })}
            placeholder="Enter username"
            className="border-[#E8E4F3] focus:border-[#8B7A9F]"
          />
        </div>
        
        <div>
        <Label className="text-sm text-[#5A4B70] mb-1.5">Date of Birth</Label>
        <Input 
            type="date"
            value={profile?.date_of_birth || ''}
            onChange={(e) => onUpdate({ date_of_birth: e.target.value })}
            className="border-[#E8E4F3] focus:border-[#8B7A9F]"
          />
        </div>
        
        <div>
        <Label className="text-sm text-[#5A4B70] mb-1.5">Phone Number</Label>
        <Input 
            type="tel"
            value={profile?.phone_number || ''}
            onChange={(e) => onUpdate({ phone_number: e.target.value })}
            placeholder="Enter phone number"
            className="border-[#E8E4F3] focus:border-[#8B7A9F]"
          />
        </div>
      </div>
    </div>

    {/* Baby */}
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Baby className="w-5 h-5 text-[#8B7A9F]" />
        <h3 className="text-lg font-semibold text-[#4A4458]">Baby</h3>
      </div>
      
      <div className="space-y-4">
        <div>
        <Label className="text-sm text-[#5A4B70] mb-1.5">Baby Full Name</Label>
        <Input 
            value={profile?.baby_full_name || ''} 
            onChange={(e) => onUpdate({ baby_full_name: e.target.value })}
            placeholder="Enter baby's name"
            className="border-[#E8E4F3] focus:border-[#8B7A9F]"
          />
        </div>
        
        <div>
        <Label className="text-sm text-[#5A4B70] mb-1.5">Baby Date of Birth</Label>
        <Input 
            type="date"
            value={profile?.baby_date_of_birth || ''}
            onChange={(e) => onUpdate({ baby_date_of_birth: e.target.value })}
            className="border-[#E8E4F3] focus:border-[#8B7A9F]"
          />
        </div>
        
        <div>
        <Label className="text-sm text-[#5A4B70] mb-1.5">Baby Gender</Label>
        <Select 
            value={profile?.baby_gender || ''} 
            onValueChange={(value) => onUpdate({ baby_gender: value })}
          >
            <SelectTrigger id="baby-gender" className="border-[#E8E4F3] focus:border-[#8B7A9F]">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boy">Boy</SelectItem>
              <SelectItem value="girl">Girl</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    {/* Support System */}
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-[#8B7A9F]" />
        <h3 className="text-lg font-semibold text-[#4A4458]">Support System</h3>
      </div>
      
      <div className="space-y-4">
        <div>
        <Label className="text-sm text-[#5A4B70] mb-1.5">Type</Label>
        <Select 
            value={profile?.support_type || ''} 
            onValueChange={(value) => onUpdate({ support_type: value })}
          >
            <SelectTrigger id="support-type" className="border-[#E8E4F3] focus:border-[#8B7A9F]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="partner">Partner</SelectItem>
              <SelectItem value="nanny">Nanny</SelectItem>
              <SelectItem value="mother">Mother</SelectItem>
              <SelectItem value="friend">Friend</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
        <Label className="text-sm text-[#5A4B70] mb-1.5">Name</Label>
        <Input 
            value={profile?.support_name || ''} 
            onChange={(e) => onUpdate({ support_name: e.target.value })}
            placeholder="Enter name"
            className="border-[#E8E4F3] focus:border-[#8B7A9F]"
          />
        </div>
        
        <div>
        <Label className="text-sm text-[#5A4B70] mb-1.5">Email</Label>
        <Input 
            type="email"
            value={profile?.support_email || ''}
            onChange={(e) => onUpdate({ support_email: e.target.value })}
            placeholder="Enter email"
            className="border-[#E8E4F3] focus:border-[#8B7A9F]"
          />
        </div>
        
        <div>
        <Label className="text-sm text-[#5A4B70] mb-1.5">Phone Number</Label>
        <Input 
            type="tel"
            value={profile?.support_phone || ''}
            onChange={(e) => onUpdate({ support_phone: e.target.value })}
            placeholder="Enter phone number"
            className="border-[#E8E4F3] focus:border-[#8B7A9F]"
          />
        </div>
      </div>
      
      {hasSupport && (
        <Button
          onClick={() => setShowRemoveDialog(true)}
          variant="outline"
          className="w-full border-[#8B4A4A] text-[#8B4A4A] hover:bg-[#F5E6EA] hover:text-[#7A4040]"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Remove Support Person
        </Button>
      )}
    </div>

    <DeleteConfirmationDialog
      open={showRemoveDialog}
      onOpenChange={setShowRemoveDialog}
      onConfirm={handleRemoveSupport}
      title="Remove support person?"
      description="This will clear all support person information from your profile."
    />

    <Button
      type="button"
      onClick={onSave}
      disabled={isSaving}
      className={`w-full py-6 rounded-2xl font-medium text-white transition-all ${
        saveSuccess
          ? 'bg-green-500 hover:bg-green-600'
          : 'bg-[#5A4B70] hover:bg-[#5A4B70]'
      }`}
    >
      {saveSuccess ? (
        <>
          <Check className="w-5 h-5 mr-2" />
          Saved Successfully
        </>
      ) : isSaving ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Saving...
        </>
      ) : (
        'Save Changes'
      )}
    </Button>
  </div>
);
}