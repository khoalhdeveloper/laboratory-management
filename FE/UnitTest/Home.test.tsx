import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../src/source/page/Patient/Home';
import { userAPI, testResultsAPI } from '../src/source/page/Axios/Axios';
import { useGlobalTheme } from '../src/contexts/GlobalThemeContext';

// Mock dependencies
jest.mock('../src/source/page/Axios/Axios', () => ({
  userAPI: {
    getCurrentUser: jest.fn(),
  },
  testResultsAPI: {
    getMyTestResults: jest.fn(),
    getTestResults: jest.fn(),
  },
}));

jest.mock('../src/contexts/GlobalThemeContext', () => ({
  useGlobalTheme: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const mockGetCurrentUser = userAPI.getCurrentUser as jest.MockedFunction<typeof userAPI.getCurrentUser>;
const mockGetMyTestResults = testResultsAPI.getMyTestResults as jest.MockedFunction<typeof testResultsAPI.getMyTestResults>;
const mockUseGlobalTheme = useGlobalTheme as jest.MockedFunction<typeof useGlobalTheme>;

const renderHome = () => {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
};

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGlobalTheme.mockReturnValue({
      isDarkMode: false,
      toggleTheme: jest.fn(),
    });
  });

  it('should render home component with complete profile', async () => {
    mockGetCurrentUser.mockResolvedValue({
      data: {
        data: {
          fullName: 'Test User',
          dateOfBirth: '1990-01-01',
          age: 33,
          gender: 'Male',
          address: '123 Test St',
          phoneNumber: '1234567890',
          email: 'test@test.com',
          identifyNumber: '123456789012',
        },
      },
    } as any);

    mockGetMyTestResults.mockResolvedValue({
      data: { data: [] },
    } as any);

    renderHome();

    await waitFor(() => {
      expect(screen.getByText(/Personal/i)).toBeInTheDocument();
      expect(screen.getByText(/Record/i)).toBeInTheDocument();
    });
  });

  it('should display test reports when loaded', async () => {
    mockGetCurrentUser.mockResolvedValue({
      data: {
        data: {
          fullName: 'Test User',
          dateOfBirth: '1990-01-01',
          age: 33,
          gender: 'Male',
          address: '123 Test St',
          phoneNumber: '1234567890',
          email: 'test@test.com',
          identifyNumber: '123456789012',
        },
      },
    } as any);

    const mockTestReports = [
      {
        testOrder: {
          order_code: 'ORD001',
          test_type: 'Blood Test',
        },
        testResult: {
          createdAt: new Date().toISOString(),
        },
      },
    ];

    mockGetMyTestResults.mockResolvedValue({
      data: { data: mockTestReports },
    } as any);

    renderHome();

    await waitFor(() => {
      // Test History tab button should be visible
      const testHistoryButton = screen.getByRole('button', { name: /Test History/i });
      expect(testHistoryButton).toBeInTheDocument();
    });
  });

  it('should handle API error gracefully', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('API Error'));

    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    renderHome();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/patient/incomplete-profile', { replace: true });
    });
  });
});

