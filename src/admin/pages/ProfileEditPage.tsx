import React, { useEffect, useState } from 'react';
import {
    Box,
    Flex,
    Typography,
    Button,
    TextInput,
    DatePicker,
    Field,
    Loader,
    Divider,
    Avatar,
    Status,
} from '@strapi/design-system';
import { User, ArrowLeft, Check, Upload, Lock, Mail, Phone, Calendar, PresentationChart, PriceTag } from '@strapi/icons';
import { useAuth, useFetchClient } from '@strapi/admin/strapi-admin';

interface ProfileData {
    id: number;
    university: string;
    birth: string;
    phone: string;
    identifier: string;
    avatar: any;
}

export default function ProfileEditPage() {
    const user = useAuth('ProfileEditPage', (state: any) => state.user);
    const { get, put } = useFetchClient();

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        university: '',
        birth: '',
        phone: '',
        identifier: '',
        email: '',
        firstname: '',
        lastname: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                setLoading(true);
                const response = await get(`/api/profiles/me?userId=${user.id}`);

                if (response.data?.data) {
                    const item = response.data.data;
                    setProfile({
                        id: item.id,
                        university: item.university || '',
                        birth: item.birth || '',
                        phone: item.phone || '',
                        identifier: item.identifier || '',
                        avatar: item.avatar,
                    });
                    setFormData({
                        university: item.university || '',
                        birth: item.birth || '',
                        phone: item.phone || '',
                        identifier: item.identifier || '',
                        email: user.email || '',
                        firstname: user.firstname || '',
                        lastname: user.lastname || '',
                    });
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, get]);

    const handleInputChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (name: string, value: string) => {
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile?.id) return;

        try {
            setUploadingAvatar(true);
            const formDataUpload = new FormData();
            formDataUpload.append('files', file);
            formDataUpload.append('ref', 'api::profile.profile');
            formDataUpload.append('refId', String(profile.id));
            formDataUpload.append('field', 'avatar');

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload,
            });

            if (uploadResponse.ok) {
                const uploadedFiles = await uploadResponse.json();
                if (uploadedFiles?.[0]) {
                    setProfile(prev => prev ? { ...prev, avatar: uploadedFiles[0] } : null);
                }
            }
        } catch (err) {
            console.error('Error uploading avatar:', err);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.id) return;

        try {
            setSaving(true);
            await put(`/api/profiles/${profile.id}`, {
                data: {
                    university: formData.university,
                    birth: formData.birth,
                    phone: formData.phone,
                    identifier: formData.identifier,
                }
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving profile:', err);
            alert('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        alert('Password change feature requires admin API integration');
    };

    const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || user?.username || 'User';
    const avatarUrl = profile?.avatar?.url
        ? (profile.avatar.url.startsWith('http') ? profile.avatar.url : `${window.location.origin}${profile.avatar.url}`)
        : null;
    const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

    if (loading) {
        return (
            <Flex justifyContent="center" alignItems="center" height="400px">
                <Loader>Loading profile...</Loader>
            </Flex>
        );
    }

    return (
        <Box padding={8} background="neutral100">
            {/* Header */}
            <Flex gap={3} alignItems="center" marginBottom={6}>
                <User width={24} height={24} />
                <Box>
                    <Typography variant="alpha" as="h1">Edit Profile</Typography>
                    <Typography variant="epsilon" textColor="neutral600">
                        Manage your account information
                    </Typography>
                </Box>
            </Flex>

            {/* Success message */}
            {success && (
                <Box marginBottom={4}>
                    <Status variant="success" showBullet={false}>
                        <Typography>Profile saved successfully!</Typography>
                    </Status>
                </Box>
            )}

            {/* Avatar Section */}
            <Box background="neutral0" padding={6} hasRadius shadow="tableShadow" marginBottom={4}>
                <Typography variant="delta" marginBottom={4}>Profile Photo</Typography>
                <Flex gap={4} alignItems="center">
                    <Box position="relative">
                        {avatarUrl ? (
                            <Avatar src={avatarUrl} alt={fullName} />
                        ) : (
                            <Avatar>{initials}</Avatar>
                        )}
                        {uploadingAvatar && (
                            <Box position="absolute" top="0" left="0" right="0" bottom="0" background="neutral800" style={{ opacity: 0.5 }}>
                                <Loader small />
                            </Box>
                        )}
                    </Box>
                    <Box>
                        <label htmlFor="avatar-upload">
                            <Button as="span" variant="secondary" startIcon={<Upload />}>
                                Change Photo
                            </Button>
                        </label>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleAvatarUpload}
                        />
                        <Typography variant="pi" textColor="neutral600" marginTop={2}>
                            JPG, PNG or GIF. Max size 2MB.
                        </Typography>
                    </Box>
                </Flex>
            </Box>

            {/* Profile Form */}
            <form onSubmit={handleSubmit}>
                <Box background="neutral0" padding={6} hasRadius shadow="tableShadow" marginBottom={4}>
                    <Typography variant="delta" marginBottom={4}>Profile Information</Typography>

                    <Flex gap={4} wrap="wrap">
                        <Box flex="1" minWidth="280px">
                            <Field.Root name="firstname">
                                <Field.Label>First Name</Field.Label>
                                <TextInput
                                    value={formData.firstname}
                                    disabled
                                    placeholder="Enter first name"
                                />
                                <Field.Hint>Contact admin to change</Field.Hint>
                            </Field.Root>
                        </Box>

                        <Box flex="1" minWidth="280px">
                            <Field.Root name="lastname">
                                <Field.Label>Last Name</Field.Label>
                                <TextInput
                                    value={formData.lastname}
                                    disabled
                                    placeholder="Enter last name"
                                />
                                <Field.Hint>Contact admin to change</Field.Hint>
                            </Field.Root>
                        </Box>

                        <Box flex="1" minWidth="280px">
                            <Field.Root name="email">
                                <Field.Label>Email</Field.Label>
                                <TextInput
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    placeholder="Enter email"
                                />
                                <Field.Hint>Contact admin to change</Field.Hint>
                            </Field.Root>
                        </Box>

                        <Box flex="1" minWidth="280px">
                            <Field.Root name="identifier">
                                <Field.Label>Member ID</Field.Label>
                                <TextInput
                                    value={formData.identifier}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('identifier', e.target.value)}
                                    placeholder="Enter member ID"
                                />
                            </Field.Root>
                        </Box>

                        <Box flex="1" minWidth="280px">
                            <Field.Root name="university">
                                <Field.Label>University</Field.Label>
                                <TextInput
                                    value={formData.university}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('university', e.target.value)}
                                    placeholder="Enter university"
                                />
                            </Field.Root>
                        </Box>

                        <Box flex="1" minWidth="280px">
                            <Field.Root name="phone">
                                <Field.Label>Phone Number</Field.Label>
                                <TextInput
                                    value={formData.phone}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                                    placeholder="Enter phone number"
                                />
                            </Field.Root>
                        </Box>

                        <Box flex="1" minWidth="280px">
                            <Field.Root name="birth">
                                <Field.Label>Date of Birth</Field.Label>
                                <TextInput
                                    type="date"
                                    value={formData.birth}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('birth', e.target.value)}
                                />
                            </Field.Root>
                        </Box>
                    </Flex>

                    <Divider marginTop={6} marginBottom={4} />

                    <Flex justifyContent="flex-end">
                        <Button type="submit" startIcon={<Check />} loading={saving}>
                            Save Changes
                        </Button>
                    </Flex>
                </Box>
            </form>

            {/* Password Form */}
            <form onSubmit={handlePasswordSubmit}>
                <Box background="neutral0" padding={6} hasRadius shadow="tableShadow">
                    <Typography variant="delta" marginBottom={4}>Change Password</Typography>

                    <Flex gap={4} wrap="wrap">
                        <Box flex="1" minWidth="280px">
                            <Field.Root name="currentPassword">
                                <Field.Label>Current Password</Field.Label>
                                <TextInput
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange('currentPassword', e.target.value)}
                                    placeholder="Enter current password"
                                />
                            </Field.Root>
                        </Box>

                        <Box flex="1" minWidth="280px" />

                        <Box flex="1" minWidth="280px">
                            <Field.Root name="newPassword">
                                <Field.Label>New Password</Field.Label>
                                <TextInput
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange('newPassword', e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </Field.Root>
                        </Box>

                        <Box flex="1" minWidth="280px">
                            <Field.Root name="confirmPassword">
                                <Field.Label>Confirm Password</Field.Label>
                                <TextInput
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange('confirmPassword', e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </Field.Root>
                        </Box>
                    </Flex>

                    <Divider marginTop={6} marginBottom={4} />

                    <Flex justifyContent="flex-end">
                        <Button type="submit" variant="secondary" startIcon={<Lock />} loading={saving}>
                            Update Password
                        </Button>
                    </Flex>
                </Box>
            </form>
        </Box>
    );
}
