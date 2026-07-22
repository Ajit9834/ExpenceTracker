import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#82E0AA', '#AEB6BF',
  '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#00B894',
];

export function TrendLineChart({ data, title }: { data: ChartData; title: string }) {
  const { darkMode } = useTheme();

  const chartData = {
    labels: data.labels,
    datasets: [{
      label: title,
      data: data.values,
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#8B5CF6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: darkMode ? '#374151' : '#fff',
        titleColor: darkMode ? '#fff' : '#111827',
        bodyColor: darkMode ? '#d1d5db' : '#374151',
        borderColor: darkMode ? '#4B5563' : '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: darkMode ? '#9CA3AF' : '#6B7280', font: { size: 11 } },
      },
      y: {
        grid: { color: darkMode ? '#374151' : '#F3F4F6' },
        ticks: { color: darkMode ? '#9CA3AF' : '#6B7280', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
}

export function CategoryBarChart({ data, title }: { data: ChartData; title: string }) {
  const { darkMode } = useTheme();

  const chartData = {
    labels: data.labels,
    datasets: [{
      label: title,
      data: data.values,
      backgroundColor: data.colors || DEFAULT_COLORS.slice(0, data.labels.length),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: darkMode ? '#374151' : '#fff',
        titleColor: darkMode ? '#fff' : '#111827',
        bodyColor: darkMode ? '#d1d5db' : '#374151',
        borderColor: darkMode ? '#4B5563' : '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: darkMode ? '#9CA3AF' : '#6B7280', font: { size: 11 } },
      },
      y: {
        grid: { color: darkMode ? '#374151' : '#F3F4F6' },
        ticks: { color: darkMode ? '#9CA3AF' : '#6B7280', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}

export function CategoryDoughnutChart({ data }: { data: ChartData; title?: string }) {
  const { darkMode } = useTheme();

  const chartData = {
    labels: data.labels,
    datasets: [{
      data: data.values,
      backgroundColor: data.colors || DEFAULT_COLORS.slice(0, data.labels.length),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          color: darkMode ? '#D1D5DB' : '#374151',
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: darkMode ? '#374151' : '#fff',
        titleColor: darkMode ? '#fff' : '#111827',
        bodyColor: darkMode ? '#d1d5db' : '#374151',
        borderColor: darkMode ? '#4B5563' : '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

export function CategoryPieChart({ data }: { data: ChartData; title?: string }) {
  const { darkMode } = useTheme();

  const chartData = {
    labels: data.labels,
    datasets: [{
      data: data.values,
      backgroundColor: data.colors || DEFAULT_COLORS.slice(0, data.labels.length),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          color: darkMode ? '#D1D5DB' : '#374151',
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: darkMode ? '#374151' : '#fff',
        titleColor: darkMode ? '#fff' : '#111827',
        bodyColor: darkMode ? '#d1d5db' : '#374151',
        borderColor: darkMode ? '#4B5563' : '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Pie data={chartData} options={options} />
    </div>
  );
}

export function IncomeVsExpenseChart({ incomeData, expenseData, labels }: {
  incomeData: number[];
  expenseData: number[];
  labels: string[];
}) {
  const { darkMode } = useTheme();

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Expense',
        data: expenseData,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          color: darkMode ? '#D1D5DB' : '#374151',
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: darkMode ? '#374151' : '#fff',
        titleColor: darkMode ? '#fff' : '#111827',
        bodyColor: darkMode ? '#d1d5db' : '#374151',
        borderColor: darkMode ? '#4B5563' : '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: darkMode ? '#9CA3AF' : '#6B7280', font: { size: 11 } },
      },
      y: {
        grid: { color: darkMode ? '#374151' : '#F3F4F6' },
        ticks: { color: darkMode ? '#9CA3AF' : '#6B7280', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}
