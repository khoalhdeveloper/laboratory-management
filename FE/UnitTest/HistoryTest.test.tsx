import { render, screen, waitFor } from '@testing-library/react';
import HistoryTest from '../src/source/page/Patient/HistoryTest';
import { testResultsAPI } from '../src/source/page/Axios/Axios';
import { GlobalThemeProvider } from '../src/contexts/GlobalThemeContext';

// Mock dependencies
jest.mock('../src/source/page/Axios/Axios', () => ({
  testResultsAPI: {
    getMyTestResults: jest.fn(),
    getTestResults: jest.fn(),
  },
}));

const mockGetMyTestResults = testResultsAPI.getMyTestResults as jest.MockedFunction<typeof testResultsAPI.getMyTestResults>;

describe('HistoryTest', () => {
  const mockUserData = {
    userid: 'user123',
    fullName: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render history test component', async () => {
    mockGetMyTestResults.mockResolvedValue({
      data: { data: [] },
    } as any);

    render(
      <GlobalThemeProvider>
        <HistoryTest userData={mockUserData} />
      </GlobalThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test History/i)).toBeInTheDocument();
    });
  });

  it('should display test reports when loaded', async () => {
    const mockTestReports = [
      {
        testOrder: {
          order_code: 'ORD001',
          patient_name: 'Test User',
          test_type: 'Blood Test',
          status: 'completed',
        },
        testResult: {
          createdAt: new Date().toISOString(),
          doctor_name: 'Dr. Smith',
        },
      },
    ];

    mockGetMyTestResults.mockResolvedValue({
      data: { data: mockTestReports },
    } as any);

    render(
      <GlobalThemeProvider>
        <HistoryTest userData={mockUserData} />
      </GlobalThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/ORD001/i)).toBeInTheDocument();
      const bloodTestElements = screen.getAllByText(/Blood Test/i);
      expect(bloodTestElements.length).toBeGreaterThan(0);
    });
  });

  it('should handle API error', async () => {
    mockGetMyTestResults.mockRejectedValue(new Error('API Error'));

    render(
      <GlobalThemeProvider>
        <HistoryTest userData={mockUserData} />
      </GlobalThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load test results/i)).toBeInTheDocument();
    });
  });
});

