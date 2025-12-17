import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../src/source/page/Patient/Header';
import { userAPI, notificationAPI } from '../src/source/page/Axios/Axios';
import { useGlobalTheme } from '../src/contexts/GlobalThemeContext';

// Mock dependencies
jest.mock('../src/source/page/Axios/Axios', () => ({
  userAPI: {
    getCurrentUser: jest.fn(),
  },
  notificationAPI: {
    getMessagesByUserId: jest.fn(),
  },
}));

jest.mock('../src/contexts/GlobalThemeContext', () => ({
  useGlobalTheme: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ pathname: '/patient/dashboard' }),
}));

const mockGetCurrentUser = userAPI.getCurrentUser as jest.MockedFunction<typeof userAPI.getCurrentUser>;
const mockGetMessagesByUserId = notificationAPI.getMessagesByUserId as jest.MockedFunction<typeof notificationAPI.getMessagesByUserId>;
const mockUseGlobalTheme = useGlobalTheme as jest.MockedFunction<typeof useGlobalTheme>;

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
};

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGlobalTheme.mockReturnValue({
      isDarkMode: false,
      toggleTheme: jest.fn(),
    });
  });

  it('should render header with Patient title', async () => {
    mockGetCurrentUser.mockResolvedValue({
      data: {
        data: {
          userid: 'user123',
          fullName: 'Test User',
        },
      },
    } as any);

    mockGetMessagesByUserId.mockResolvedValue({
      data: { data: [] },
    } as any);

    renderHeader();

    await waitFor(() => {
      expect(screen.getByText('Patient')).toBeInTheDocument();
    });
  });

  it('should display notification count badge', async () => {
    mockGetCurrentUser.mockResolvedValue({
      data: {
        data: {
          userid: 'user123',
          fullName: 'Test User',
        },
      },
    } as any);

    mockGetMessagesByUserId.mockResolvedValue({
      data: {
        data: [
          { isRead: false },
          { isRead: false },
          { isRead: true },
        ],
      },
    } as any);

    renderHeader();

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('should handle API error gracefully', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('API Error'));

    renderHeader();

    await waitFor(() => {
      // Component should still render even if API fails
      expect(screen.getByText('Patient')).toBeInTheDocument();
    });
  });
});

