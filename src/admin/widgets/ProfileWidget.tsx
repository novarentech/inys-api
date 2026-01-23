import { useEffect, useState } from 'react';
import {
    Box,
    Flex,
    Typography,
    Button,
    Badge,
    Loader,
    Divider,
    Avatar,
} from '@strapi/design-system';
import { User, PresentationChart, Calendar, Phone, PriceTag, Pencil, CheckCircle } from '@strapi/icons';
import { useAuth, useFetchClient } from '@strapi/admin/strapi-admin';

interface ProfileData {
    id: number;
    university: string;
    birth: string;
    phone: string;
    identifier: string;
    avatar: any;
}

const InfoItem = ({
    icon: Icon,
    label,
    value
}: {
    icon: any;
    label: string;
    value: string | undefined;
}) => (
    <Flex gap={3} alignItems="center" paddingTop={2} paddingBottom={2}>
        <Box background="primary100" padding={2} hasRadius>
            <Icon width={16} height={16} fill="primary600" />
        </Box>
        <Box>
            <Typography variant="pi" textColor="neutral600" textTransform="uppercase">
                {label}
            </Typography>
            <Typography variant="omega" fontWeight="semiBold">
                {value || 'Not set'}
            </Typography>
        </Box>
    </Flex>
);

export default function ProfileWidget() {
    const user = useAuth('ProfileWidget', (state: any) => state.user);
    const { get } = useFetchClient();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

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
                        university: item.university,
                        birth: item.birth,
                        phone: item.phone,
                        identifier: item.identifier,
                        avatar: item.avatar,
                    });
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, get]);

    if (loading) {
        return (
            <Box background="neutral0" padding={4} hasRadius shadow="tableShadow" height="300px">
                <Flex justifyContent="center" alignItems="center" height="100%">
                    <Loader>Loading profile...</Loader>
                </Flex>
            </Box>
        );
    }

    if (error || !user) {
        return (
            <Box background="neutral0" padding={4} hasRadius shadow="tableShadow" height="300px">
                <Flex direction="column" justifyContent="center" alignItems="center" height="100%" gap={3}>
                    <User width={48} height={48} fill="neutral500" />
                    <Typography textColor="neutral600">Unable to load profile</Typography>
                </Flex>
            </Box>
        );
    }

    const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username || 'User';
    const avatarUrl = profile?.avatar?.url
        ? (profile.avatar.url.startsWith('http') ? profile.avatar.url : `${window.location.origin}${profile.avatar.url}`)
        : null;
    const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <Box background="neutral0" hasRadius shadow="tableShadow" overflow="hidden">
            {/* Header with gradient */}
            <Box background="primary600" padding={6}>
                <Flex justifyContent="flex-end" marginBottom={2}>
                    <Badge active>
                        <Flex gap={1} alignItems="center">
                            <CheckCircle width={12} height={12} />
                            Verified
                        </Flex>
                    </Badge>
                </Flex>
                <Flex gap={4} alignItems="center">
                    {avatarUrl ? (
                        <Avatar.Item fallback={'AA'} src={avatarUrl} alt={fullName} ></Avatar.Item>
                    ) : (
                        <Avatar.Item fallback={'AA'}>{initials}</Avatar.Item>
                    )}
                    <Box>
                        <Typography variant="beta" textColor="neutral0">{fullName}</Typography>
                        <Typography variant="pi" textColor="primary200">{user.email}</Typography>
                    </Box>
                </Flex>
            </Box>

            {/* Content */}
            <Box padding={4}>
                <InfoItem icon={PriceTag} label="Member ID" value={profile?.identifier} />
                <InfoItem icon={PresentationChart} label="University" value={profile?.university} />
                <InfoItem
                    icon={Calendar}
                    label="Date of Birth"
                    value={profile?.birth ? new Date(profile.birth).toLocaleDateString(undefined, { dateStyle: 'long' }) : undefined}
                />
                <InfoItem icon={Phone} label="Phone" value={profile?.phone} />

                <Divider marginTop={4} marginBottom={4} />

                <Button
                    variant="secondary"
                    fullWidth
                    startIcon={<Pencil />}
                    onClick={() => {
                        window.location.href = '/cms/admin/plugins/profile-edit';
                    }}
                >
                    Edit Profile
                </Button>
            </Box>
        </Box>
    );
}
