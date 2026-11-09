import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { authService } from '../services/authService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { formatDate } from '../utils/formatters';
import { User, Lock, Shield, Server, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { success, error: toastError } = useToast();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Validation Error', 'Name cannot be empty.');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await authService.updateProfile({ name: name.trim(), currency });
      if (res.success && res.data) {
        updateUser(res.data);
        success('Profile Updated', 'Your profile details have been saved.');
      }
    } catch (err: any) {
      toastError('Update Failed', err.message || 'Could not update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toastError('Validation Error', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      toastError('Validation Error', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('Validation Error', 'Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await authService.updatePassword({ currentPassword, newPassword });
      success('Password Changed', 'Your password was updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toastError('Password Update Failed', err.message || 'Incorrect current password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Settings & Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your personal account credentials and application preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-base font-bold text-slate-900">Personal Information</CardTitle>
            </div>
            <CardDescription className="text-xs">Update your display name and default currency.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <Input type="email" value={user?.email || ''} disabled className="bg-slate-50 text-slate-500" />
                <p className="text-[11px] text-slate-400 mt-1">Email cannot be changed directly.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Currency</label>
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="EUR">€ EUR (Euro)</option>
                  <option value="GBP">£ GBP (British Pound)</option>
                </Select>
              </div>

              <div className="pt-2">
                <Button type="submit" isLoading={isUpdatingProfile} size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-base font-bold text-slate-900">Security & Password</CardTitle>
            </div>
            <CardDescription className="text-xs">Ensure your account uses a strong unique password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2">
                <Button type="submit" isLoading={isUpdatingPassword} size="sm" variant="outline">
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Info and Logout Card */}
      <Card className="border-slate-200/80 bg-white shadow-xs">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Account Session</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Member since {formatDate(user?.createdAt)}. Your financial data is securely encrypted.
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={logout}>
            Log out of account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

