import { useEffect, useState, useMemo } from 'react';
import {
  SingleSelect,
  SingleSelectOption,
  Box,
  Flex,
  Typography,
  Divider
} from '@strapi/design-system';
import { Widget } from '@strapi/admin/strapi-admin';
import { Eye, ChartPie, Calendar } from '@strapi/icons';
import { Line } from 'react-chartjs-2';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ScriptableContext
} from 'chart.js';

interface ViewerData {
  label: string;
  value: number;
}

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StyledContainer = styled(Box)`
  background: ${({ theme }) => theme.colors.neutral0};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.neutral150};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`;

const HeaderContainer = styled(Flex)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral150};
  padding: ${({ theme }) => theme.spaces[4]};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.neutral0} 0%, ${({ theme }) => theme.colors.neutral100} 100%);
`;

const StatCard = styled(Flex)`
  background: ${({ theme }) => theme.colors.primary100};
  padding: ${({ theme }) => theme.spaces[3]} ${({ theme }) => theme.spaces[4]};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.primary200};
`;

const ChartWrapper = styled(Box)`
  padding: ${({ theme }) => theme.spaces[4]};
  height: 320px;
  position: relative;
`;

export default function ViewerWidget() {
  const [range, setRange] = useState('today');
  const [rows, setRows] = useState<ViewerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);

        // Map UI range to API range
        const apiRange = range === 'today' ? 'today' : range === 'week' ? 'week' : 'month';

        const response = await fetch(
          `/api/viewers/stats?range=${apiRange}&group=day`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Fetch error:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range]);

  const totalViews = useMemo(() => rows.reduce((acc, curr) => acc + curr.value, 0), [rows]);

  const chartData = {
    labels: rows.map(r => r.label),
    datasets: [
      {
        label: 'Views',
        data: rows.map(r => r.value),
        borderColor: '#4945FF',
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(73, 69, 255, 0.4)');
          gradient.addColorStop(1, 'rgba(73, 69, 255, 0.02)');
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#4945FF',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        pointRadius: 4,
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#212134',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        displayColors: false,
        callbacks: {
          label: (context: any) => ` ${context.parsed.y} Viewers`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#8E8EA9',
          font: { size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(224, 224, 255, 0.5)',
          drawBorder: false,
        },
        ticks: {
          stepSize: 1,
          color: '#8E8EA9',
          font: { size: 11 },
        },
      },
    },
  };

  if (loading) return <Widget.Loading />;
  if (error) return <Widget.Error />;
  if (!rows.length && !loading) return <Widget.NoData />;

  return (
    <StyledContainer>
      <HeaderContainer justifyContent="space-between" alignItems="center" wrap="wrap" gap={4}>
        <Flex gap={3}>
          <Box padding={2} background="primary100" borderRadius="8px">
            <ChartPie width="20px" height="20px" fill="#4945FF" />
          </Box>
          <Box>
            <Typography variant="delta" fontWeight="bold" textColor="neutral800">
              Visitor Analytics
            </Typography>
            <Typography variant="pi" textColor="neutral600">
              Track your audience engagement
            </Typography>
          </Box>
        </Flex>

        <Box width={{ desktop: '200px', tablet: '100%', mobile: '100%' }}>
          <SingleSelect
            value={range}
            onChange={setRange}
            startIcon={<Calendar />}
            customizeContent={(value: string) => `Showing: ${value.charAt(0).toUpperCase() + value.slice(1)}`}
          >
            <SingleSelectOption value="today">Today</SingleSelectOption>
            <SingleSelectOption value="week">This Week</SingleSelectOption>
            <SingleSelectOption value="month">This Month</SingleSelectOption>
          </SingleSelect>
        </Box>
      </HeaderContainer>

      <Box padding={4}>
        <Flex justifyContent="space-between" alignItems="center" marginBottom={4}>
          <StatCard alignItems="center" gap={3}>
            <Eye fill="#4945FF" />
            <Box>
              <Typography variant="beta" fontWeight="bold" textColor="primary600">
                {totalViews}
              </Typography>
              <Typography variant="sigma" textColor="primary600" fontWeight="bold">
                TOTAL VIEWS
              </Typography>
            </Box>
          </StatCard>

          <Box textAlign="right">
            <Typography variant="pi" textColor="neutral500">
              Data updated just now
            </Typography>
          </Box>
        </Flex>

        <Divider unsetMargin={false} />

        <ChartWrapper>
          <Line data={chartData} options={chartOptions as any} />
        </ChartWrapper>
      </Box>
    </StyledContainer>
  );
}
