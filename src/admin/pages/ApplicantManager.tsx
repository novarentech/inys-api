import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Flex,
    Typography,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    Badge,
    Loader,
    EmptyStateLayout,
    IconButton,
} from '@strapi/design-system';
import { Check, ArrowClockwise, Briefcase, Clock, User, CheckCircle } from '@strapi/icons';
import { useFetchClient } from '@strapi/admin/strapi-admin';

interface Applicant {
    id: number;
    name: string;
    email: string;
    university: string;
    accepted: boolean;
    createdAt: string;
}

export default function ApplicantManager() {
    const { get, post } = useFetchClient();
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [refetching, setRefetching] = useState(false);
    const [acceptingId, setAcceptingId] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            setRefetching(true);
            const response = await fetch('/api/applicants');
            const data = await response.json();
            const formattedData = (data.data || []).map((item: any) => ({
                id: item.id,
                ...item,
            }));
            setApplicants(formattedData);
        } catch (error) {
            console.error('Error fetching applicants:', error);
        } finally {
            setLoading(false);
            setRefetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAccept = async (id: number) => {
        try {
            setAcceptingId(id);
            await fetch(`/api/applicants/${id}/accept`, { method: 'POST' });
            setApplicants((prev) =>
                prev.map((app) => (app.id === id ? { ...app, accepted: true } : app))
            );
        } catch (error: any) {
            console.error('Error accepting applicant:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setAcceptingId(null);
        }
    };

    const total = applicants.length;
    const acceptedCount = applicants.filter((a) => a.accepted).length;
    const pendingCount = total - acceptedCount;

    if (loading) {
        return (
            <Flex justifyContent="center" alignItems="center" height="400px">
                <Loader>Loading applicants...</Loader>
            </Flex>
        );
    }

    return (
        <Box padding={8} background="neutral100">
            {/* Header */}
            <Flex justifyContent="space-between" alignItems="center" marginBottom={6}>
                <Flex gap={3} alignItems="center">
                    <Briefcase width={24} height={24} />
                    <Box>
                        <Typography variant="alpha" as="h1">Applicant Portal</Typography>
                        <Typography variant="epsilon" textColor="neutral600">
                            Manage recruitment for the nuclear community program
                        </Typography>
                    </Box>
                </Flex>
                <Button
                    variant="secondary"
                    startIcon={<ArrowClockwise />}
                    onClick={fetchData}
                    loading={refetching}
                >
                    Refresh
                </Button>
            </Flex>

            {/* Stats */}
            <Flex gap={4} marginBottom={6}>
                <Box background="primary100" padding={4} hasRadius flex="1">
                    <Flex justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="sigma" textColor="primary600">Total Applicants</Typography>
                            <Typography variant="alpha" textColor="primary700">{total}</Typography>
                        </Box>
                        <User width={32} height={32} fill="primary600" />
                    </Flex>
                </Box>
                <Box background="success100" padding={4} hasRadius flex="1">
                    <Flex justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="sigma" textColor="success600">Accepted</Typography>
                            <Typography variant="alpha" textColor="success700">{acceptedCount}</Typography>
                        </Box>
                        <CheckCircle width={32} height={32} fill="success600" />
                    </Flex>
                </Box>
                <Box background="danger100" padding={4} hasRadius flex="1">
                    <Flex justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="sigma" textColor="danger600">Pending</Typography>
                            <Typography variant="alpha" textColor="danger700">{pendingCount}</Typography>
                        </Box>
                        <Clock width={32} height={32} fill="danger600" />
                    </Flex>
                </Box>
            </Flex>

            {/* Table */}
            <Box background="neutral0" padding={4} hasRadius shadow="tableShadow">
                <Flex justifyContent="space-between" alignItems="center" marginBottom={4}>
                    <Typography variant="beta">Recent Applicants</Typography>
                    <Badge>{applicants.length} candidates</Badge>
                </Flex>

                {applicants.length === 0 ? (
                    <EmptyStateLayout
                        icon={<User width={160} height={88} />}
                        content="No applicants found"
                    />
                ) : (
                    <Table colCount={5} rowCount={applicants.length}>
                        <Thead>
                            <Tr>
                                <Th><Typography variant="sigma">Name</Typography></Th>
                                <Th><Typography variant="sigma">University</Typography></Th>
                                <Th><Typography variant="sigma">Submitted</Typography></Th>
                                <Th><Typography variant="sigma">Status</Typography></Th>
                                <Th><Typography variant="sigma">Actions</Typography></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {applicants.map((app) => (
                                <Tr key={app.id}>
                                    <Td>
                                        <Typography variant="omega" fontWeight="bold">{app.name}</Typography>
                                        <Typography variant="pi" textColor="neutral600">{app.email}</Typography>
                                    </Td>
                                    <Td>
                                        <Typography variant="omega">{app.university}</Typography>
                                    </Td>
                                    <Td>
                                        <Typography variant="omega" textColor="neutral600">
                                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                                        </Typography>
                                    </Td>
                                    <Td>
                                        {app.accepted ? (
                                            <Badge active>Approved</Badge>
                                        ) : (
                                            <Badge backgroundColor="danger100" textColor="danger700">Pending</Badge>
                                        )}
                                    </Td>
                                    <Td>
                                        {!app.accepted ? (
                                            <Button
                                                size="S"
                                                startIcon={<Check />}
                                                onClick={() => handleAccept(app.id)}
                                                loading={acceptingId === app.id}
                                            >
                                                Accept
                                            </Button>
                                        ) : (
                                            <Typography variant="pi" textColor="success600" fontWeight="bold">
                                                Author Account Active
                                            </Typography>
                                        )}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Box>
        </Box>
    );
}
