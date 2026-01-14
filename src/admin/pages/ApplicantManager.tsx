import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Flex,
    Typography,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Status,
    Badge,
    Loader,
    Grid,
    Avatar,
    IconButton
} from '@strapi/design-system';
import {
    Check,
    User,
    ArrowClockwise,
    Briefcase,
    CheckCircle,
    CrossCircle,
    Clock
} from '@strapi/icons';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import { Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js';
import styled from 'styled-components';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// --- Styled Components for Premium Look ---

const PageContainer = styled(Box)`
  background: linear-gradient(180deg, #f6f6f9 0%, #ffffff 100%);
  min-height: 100vh;
`;

const HeaderSection = styled(Box)`
  background: linear-gradient(135deg, #212134 0%, #181824 100%);
  color: #ffffff;
  padding: ${({ theme }) => theme.spaces[6]} ${({ theme }) => theme.spaces[8]};
  margin-bottom: ${({ theme }) => theme.spaces[6]};
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;

  &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
      height: 100%;
      background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 100%);
      pointer-events: none;
  }
`;

const StatCard = styled(Box) <{ gradient?: string }>`
  background: ${({ theme, gradient }) => gradient || theme.colors.neutral0};
  padding: ${({ theme }) => theme.spaces[5]};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.neutral150};
  box-shadow: 0 4px 12px rgba(33, 33, 52, 0.08); /* slight premium shadow */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(33, 33, 52, 0.12);
  }
`;

const ChartCard = styled(Box)`
  background: ${({ theme }) => theme.colors.neutral0};
  padding: ${({ theme }) => theme.spaces[6]};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.neutral150};
  box-shadow: 0 2px 8px rgba(33, 33, 52, 0.05);
  height: 100%;
`;

const ChartContainer = styled(Box)`
  height: 320px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CustomTableContainer = styled(Box)`
  background: ${({ theme }) => theme.colors.neutral0};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.neutral150};
  box-shadow: 0 2px 12px rgba(33, 33, 52, 0.06);
  overflow: hidden;
`;

const StatusPill = styled(Flex) <{ variant: 'success' | 'danger' | 'warning' }>`
  padding: 4px 12px;
  border-radius: 20px;
  background: ${({ variant, theme }) =>
        variant === 'success' ? '#eafbe7' :
            variant === 'danger' ? '#fcecea' : '#fff4e6'};
  color: ${({ variant, theme }) =>
        variant === 'success' ? '#2f6846' :
            variant === 'danger' ? '#d02b20' : '#b25e09'};
  font-weight: 600;
  font-size: 0.75rem;
  width: fit-content;
  align-items: center;
  gap: 6px;
`;

interface Applicant {
    id: number;
    name: string;
    email: string;
    university: string;
    accepted: boolean;
    createdAt: string;
}

export default function ApplicantManager() {
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [refetching, setRefetching] = useState(false);
    const { get, post } = useFetchClient();

    const fetchData = async () => {
        try {
            setRefetching(true);
            // Use standard fetch if useFetchClient has issues, or switch to get() from hook
            // The previous user edit used fetch(), let's stick to fetch for now as it worked
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
            // Reverting to fetch since user might not have configured axios instance fully for 'post'
            const response = await fetch(`/api/applicants/${id}/accept`, { method: 'POST' });
            if (response.ok) {
                setApplicants((prev) =>
                    prev.map((app) => (app.id === id ? { ...app, accepted: true } : app))
                );
            } else {
                const err = await response.json();
                alert(err?.error?.message || 'Failed to accept');
            }
        } catch (error: any) {
            console.error('Error accepting applicant:', error);
            alert(`Error: ${error.message}`);
        }
    };

    const total = applicants.length;
    const acceptedCount = applicants.filter((a) => a.accepted).length;
    const pendingCount = total - acceptedCount;

    const universityStats = useMemo(() => {
        const stats: Record<string, number> = {};
        applicants.forEach((a) => {
            const uni = a.university || 'Unknown';
            stats[uni] = (stats[uni] || 0) + 1;
        });
        return {
            labels: Object.keys(stats),
            datasets: [
                {
                    label: 'Applicants',
                    data: Object.values(stats),
                    backgroundColor: [
                        '#4945FF',
                        '#7b79ff',
                        '#00C48C',
                        '#FFC658',
                        '#F2994A',
                        '#EB5757'
                    ],
                    borderWidth: 0,
                },
            ],
        };
    }, [applicants]);

    const statusData = {
        labels: ['Accepted', 'Pending'],
        datasets: [
            {
                label: 'Status',
                data: [acceptedCount, pendingCount],
                backgroundColor: ['#00C48C', '#EB5757'],
                borderRadius: 4,
            },
        ],
    };

    if (loading) {
        return (
            <Flex justifyContent="center" alignItems="center" height="100vh" background="neutral100">
                <Flex direction="column" gap={4}>
                    <Loader>Loading applicants...</Loader>
                    <Typography variant="pi" textColor="neutral500">Fetching data from nuclear servers...</Typography>
                </Flex>
            </Flex>
        );
    }

    return (
        <PageContainer>
            <HeaderSection>
                <Flex justifyContent="space-between" alignItems="center">
                    <Box>
                        <Flex gap={3} alignItems="center" marginBottom={2}>
                            <Box background="rgba(255,255,255,0.2)" padding={2} borderRadius="50%">
                                <Briefcase width="24px" height="24px" fill="white" />
                            </Box>
                            <Typography variant="alpha" fontWeight="bold" textColor="neutral0">
                                Applicant Portal
                            </Typography>
                        </Flex>
                        <Typography variant="epsilon" textColor="neutral150">
                            Manage recruitment for the nuclear community program
                        </Typography>
                    </Box>
                    <Button
                        startIcon={<ArrowClockwise />}
                        onClick={fetchData}
                        loading={refetching}
                        variant="secondary"
                        size="L"
                    >
                        Refresh
                    </Button>
                </Flex>
            </HeaderSection>

            <Box paddingLeft={8} paddingRight={8} paddingBottom={10}>
                {/* Stats Grid */}
                <Grid.Root gap={5} marginBottom={6}>
                    <Grid.Item col={4}>
                        <StatCard gradient="linear-gradient(135deg, #4945FF 0%, #2f2ce2 100%)">
                            <Flex justifyContent="space-between" alignItems="flex-start" marginBottom={2}>
                                <Box>
                                    <Typography variant="sigma" textColor="neutral0">TOTAL APPLICANTS</Typography>
                                    <Typography variant="alpha" fontWeight="bold" textColor="neutral0" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>{total}</Typography>
                                </Box>
                                <Box background="rgba(255,255,255,0.2)" padding={2} borderRadius="8px">
                                    <User width="20px" height="20px" fill="white" />
                                </Box>
                            </Flex>
                            <Typography variant="pi" textColor="neutral100">
                                All time applications
                            </Typography>
                        </StatCard>
                    </Grid.Item>
                    <Grid.Item col={4}>
                        <StatCard gradient="linear-gradient(135deg, #00C48C 0%, #009d70 100%)">
                            <Flex justifyContent="space-between" alignItems="flex-start" marginBottom={2}>
                                <Box>
                                    <Typography variant="sigma" textColor="neutral0">ACCEPTED</Typography>
                                    <Typography variant="alpha" fontWeight="bold" textColor="neutral0" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>{acceptedCount}</Typography>
                                </Box>
                                <Box background="rgba(255,255,255,0.2)" padding={2} borderRadius="8px">
                                    <CheckCircle width="20px" height="20px" fill="white" />
                                </Box>
                            </Flex>
                            <Typography variant="pi" textColor="neutral100">
                                Qualified candidates
                            </Typography>
                        </StatCard>
                    </Grid.Item>
                    <Grid.Item col={4}>
                        <StatCard gradient="linear-gradient(135deg, #EB5757 0%, #c93b3b 100%)">
                            <Flex justifyContent="space-between" alignItems="flex-start" marginBottom={2}>
                                <Box>
                                    <Typography variant="sigma" textColor="neutral0">PENDING REVIEW</Typography>
                                    <Typography variant="alpha" fontWeight="bold" textColor="neutral0" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>{pendingCount}</Typography>
                                </Box>
                                <Box background="rgba(255,255,255,0.2)" padding={2} borderRadius="8px">
                                    <Clock width="20px" height="20px" fill="white" />
                                </Box>
                            </Flex>
                            <Typography variant="pi" textColor="neutral100">
                                Awaiting action
                            </Typography>
                        </StatCard>
                    </Grid.Item>
                </Grid.Root>

                {/* Charts Section */}
                <Grid.Root gap={5} marginBottom={6}>
                    <Grid.Item col={6}>
                        <ChartCard>
                            <Typography variant="delta" fontWeight="bold" marginBottom={6}>University Distribution</Typography>
                            <ChartContainer>
                                <Pie
                                    data={universityStats}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'right',
                                                labels: { boxWidth: 12, usePointStyle: true, padding: 20 }
                                            }
                                        }
                                    }}
                                />
                            </ChartContainer>
                        </ChartCard>
                    </Grid.Item>
                    <Grid.Item col={6}>
                        <ChartCard>
                            <Typography variant="delta" fontWeight="bold" marginBottom={6}>Applicant Status</Typography>
                            <ChartContainer>
                                <Bar
                                    data={statusData}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: {
                                                grid: { display: false },
                                                beginAtZero: true
                                            },
                                            x: {
                                                grid: { display: false }
                                            }
                                        }
                                    }}
                                />
                            </ChartContainer>
                        </ChartCard>
                    </Grid.Item>
                </Grid.Root>

                {/* Main Table */}
                <CustomTableContainer>
                    <Box padding={6} borderColor="#eaeaef">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Typography variant="delta" fontWeight="bold">Recent Applicants</Typography>
                            <Badge>{applicants.length} candidates found</Badge>
                        </Flex>
                    </Box>
                    <Table colCount={5} rowCount={applicants.length}>
                        <Thead>
                            <Tr>
                                <Th><Typography variant="sigma" textColor="neutral600">NAME</Typography></Th>
                                <Th><Typography variant="sigma" textColor="neutral600">UNIVERSITY</Typography></Th>
                                <Th><Typography variant="sigma" textColor="neutral600">SUBMITTED</Typography></Th>
                                <Th><Typography variant="sigma" textColor="neutral600">STATUS</Typography></Th>
                                <Th><Typography variant="sigma" textColor="neutral600">ACTIONS</Typography></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {applicants.map((app) => (
                                <Tr key={app.id}>
                                    <Td>
                                        <Flex gap={3} alignItems="center">
                                            <Box>
                                                <Typography fontWeight="bold" textColor="neutral800" display="block">{app.name}</Typography>
                                                <Typography variant="pi" textColor="neutral500">{app.email}</Typography>
                                            </Box>
                                        </Flex>
                                    </Td>
                                    <Td>
                                        <Typography textColor="neutral800">{app.university}</Typography>
                                    </Td>
                                    <Td>
                                        <Typography textColor="neutral600">
                                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                                        </Typography>
                                    </Td>
                                    <Td>
                                        {app.accepted ? (
                                            <StatusPill variant="success">
                                                <CheckCircle width="12px" height="12px" />
                                                Approved
                                            </StatusPill>
                                        ) : (
                                            <StatusPill variant="danger">
                                                <Clock width="12px" height="12px" />
                                                Pending
                                            </StatusPill>
                                        )}
                                    </Td>
                                    <Td>
                                        {!app.accepted ? (
                                            <Button
                                                size="S"
                                                onClick={() => handleAccept(app.id)}
                                                variant="default"
                                                endIcon={<Check />}
                                            >
                                                Accept
                                            </Button>
                                        ) : (
                                            <Flex gap={2} alignItems="center">
                                                <Typography variant="pi" textColor="success600" fontWeight="bold">Author Account Active</Typography>
                                            </Flex>
                                        )}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                    {applicants.length === 0 && (
                        <Box padding={8} textAlign="center">
                            <Typography variant="beta" textColor="neutral500">No applicants found</Typography>
                        </Box>
                    )}
                </CustomTableContainer>
            </Box>
        </PageContainer>
    );
}
