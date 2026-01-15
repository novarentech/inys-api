import { useEffect, useState } from 'react';
import {
    Box,
    Flex,
    Typography,
    Avatar,
    Loader,
    Badge,
    Grid,
    Divider,
} from '@strapi/design-system';
import { useAuth, useFetchClient } from '@strapi/admin/strapi-admin';
import styled from 'styled-components';
import { User, Book, Calendar, Phone, Information } from '@strapi/icons';

const StyledContainer = styled(Box)`
  background: ${({ theme }) => theme.colors.neutral0};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.neutral150};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }
`;

const HeaderBox = styled(Box)`
  background: linear-gradient(135deg, #1e1e2f 0%, #4a4a7d 100%);
  padding: ${({ theme }) => theme.spaces[7]};
  color: white;
  position: relative;
`;

const AvatarWrapper = styled(Flex)`
  position: absolute;
  bottom: -40px;
  left: 32px;
  border: 5px solid white;
  border-radius: 50%;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2;
`;

const ContentBox = styled(Box)`
  padding: ${({ theme }) => theme.spaces[12]} ${({ theme }) => theme.spaces[8]} ${({ theme }) => theme.spaces[7]} ${({ theme }) => theme.spaces[8]};
`;

const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <Flex gap={3} alignItems="center" marginBottom={5}>
        <Box padding={3} background="primary100" borderRadius="12px">
            <Icon width="18px" height="18px" fill="#4945ff" />
        </Box>
        <Box>
            <Typography variant="sigma" textColor="neutral500" fontWeight="bold" display="block" style={{ letterSpacing: '0.05em' }}>
                {label}
            </Typography>
            <Typography variant="omega" fontWeight="bold" textColor="neutral800">
                {value || 'Not set'}
            </Typography>
        </Box>
    </Flex>
);

interface ProfileData {
    id: number;
    university: string;
    birth: string;
    phone: string;
    identifier: string;
    avatar: any;
}

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
                // Fetch profiles populated with user and avatar, filtered by the authenticated user's ID
                const response = await get(`/api/profiles?filters[user][id][$eq]=${user.id}&populate=*`);

                if (response.data && response.data.data && response.data.data.length > 0) {
                    const item = response.data.data[0];
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
            <StyledContainer>
                <Flex justifyContent="center" alignItems="center" height="300px">
                    <Loader>Syncing your profile...</Loader>
                </Flex>
            </StyledContainer>
        );
    }

    if (error || !user) {
        return (
            <StyledContainer>
                <Flex justifyContent="center" alignItems="center" height="300px" padding={6} direction="column" gap={4}>
                    <Typography variant="beta" textColor="danger600">Profile Not Found</Typography>
                    <Typography textColor="neutral600" textAlign="center">
                        We couldn't retrieve your additional profile details. Please contact the administrator.
                    </Typography>
                </Flex>
            </StyledContainer>
        );
    }

    const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username || 'Nuclear Member';
    const avatarUrl = profile?.avatar?.url ? (profile.avatar.url.startsWith('http') ? profile.avatar.url : `${window.location.origin}${profile.avatar.url}`) : null;
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <StyledContainer>
            <HeaderBox>
                <Flex justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="beta" fontWeight="bold" textColor="neutral0">
                        Account Overview
                    </Typography>
                    <Badge variant="success">Verified</Badge>
                </Flex>
                <AvatarWrapper>
                    <Avatar
                        src={avatarUrl}
                        alt={fullName}
                        fallback={initials}
                        width="90px"
                        height="90px"
                    />
                </AvatarWrapper>
            </HeaderBox>

            <ContentBox>
                <Box marginBottom={8}>
                    <Typography variant="alpha" fontWeight="bold" textColor="neutral800" display="block">
                        {fullName}
                    </Typography>
                    <Typography variant="epsilon" textColor="neutral500">
                        Member of Nuclear Community
                    </Typography>
                </Box>

                <Grid.Root gap={4}>
                    <Grid.Item col={6}>
                        <InfoItem
                            icon={Book}
                            label="INSTITUTION"
                            value={profile?.university}
                        />
                    </Grid.Item>
                    <Grid.Item col={6}>
                        <InfoItem
                            icon={Information}
                            label="MEMBER ID"
                            value={profile?.identifier}
                        />
                    </Grid.Item>
                    <Grid.Item col={6}>
                        <InfoItem
                            icon={Calendar}
                            label="DATE OF BIRTH"
                            value={profile?.birth ? new Date(profile.birth).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Not specified'}
                        />
                    </Grid.Item>
                    <Grid.Item col={6}>
                        <InfoItem
                            icon={Phone}
                            label="CONTACT"
                            value={profile?.phone}
                        />
                    </Grid.Item>
                </Grid.Root>
            </ContentBox>
        </StyledContainer>
    );
}
