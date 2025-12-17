import { render, screen, waitFor } from '@testing-library/react';
import HistoryProfile from '../src/source/page/Patient/HistoryProfile';
import { userAPI } from '../src/source/page/Axios/Axios';
import { useGlobalTheme } from '../src/contexts/GlobalThemeContext';

// Mock dependencies
jest.mock('../src/source/page/Axios/Axios', () => ({
  userAPI: {
    getUserHistory: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

jest.mock('../src/contexts/GlobalThemeContext', () => ({
  useGlobalTheme: jest.fn(),
}));

const mockGetUserHistory = userAPI.getUserHistory as jest.MockedFunction<typeof userAPI.getUserHistory>;
const mockGetCurrentUser = userAPI.getCurrentUser as jest.MockedFunction<typeof userAPI.getCurrentUser>;
const mockUseGlobalTheme = useGlobalTheme as jest.MockedFunction<typeof useGlobalTheme>;

describe('HistoryProfile', () => {
  const mockShowNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGlobalTheme.mockReturnValue({
      isDarkMode: false,
      toggleTheme: jest.fn(),
    });
    mockGetCurrentUser.mockResolvedValue({
      data: { userid: 'user123' },
    } as any);
  });

  it('should render history profile component', async () => {
    mockGetUserHistory.mockResolvedValue({
      data: [],
    } as any);

    render(<HistoryProfile showNotification={mockShowNotification} />);

    await waitFor(() => {
      expect(screen.getByText(/Change History/i)).toBeInTheDocument();
    });
  });

  it('should display history data when loaded', async () => {
    const mockHistoryData = [
      {
        _id: '1',
        fieldChanges: [
          {
            _id: '1',
            field: 'fullName',
            oldValue: 'Old Name',
            newValue: 'New Name',
          },
        ],
        createdAt: new Date().toISOString(),
        performedBy: 'user123',
      },
    ];

    mockGetUserHistory.mockResolvedValue({
      data: mockHistoryData,
    } as any);

    render(<HistoryProfile showNotification={mockShowNotification} />);

    await waitFor(() => {
      expect(screen.getByText(/Full Name/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle API error', async () => {
    mockGetUserHistory.mockRejectedValue(new Error('API Error'));

    render(<HistoryProfile showNotification={mockShowNotification} />);

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith(
        expect.stringContaining('Unable to load history data'),
        'error'
      );
    });
  });
});

