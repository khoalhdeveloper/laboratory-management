import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../src/source/page/Patient/Sidebar';
import { userAPI } from '../src/source/page/Axios/Axios';
import { useGlobalTheme } from '../src/contexts/GlobalThemeContext';

// Mock dependencies
jest.mock('../src/source/page/Axios/Axios', () => ({
  userAPI: {
    getCurrentUser: jest.fn(),
  },
}));

jest.mock('../src/contexts/GlobalThemeContext', () => ({
  useGlobalTheme: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ pathname: '/patient/dashboard' }),
  useNavigate: () => jest.fn(),
}));

const mockGetCurrentUser = userAPI.getCurrentUser as jest.MockedFunction<typeof userAPI.getCurrentUser>;
const mockUseGlobalTheme = useGlobalTheme as jest.MockedFunction<typeof useGlobalTheme>;

const renderSidebar = () => {
  return render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  );
};

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGlobalTheme.mockReturnValue({
      isDarkMode: false,
      toggleTheme: jest.fn(),
    });
  });

  it('should render sidebar with logo', async () => {
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
          identifyNumber: '123456789',
        },
      },
    } as any);

    renderSidebar();

    await waitFor(() => {
      const logo = screen.getByAltText('LabTrack Logo');
      expect(logo).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('should disable navigation when profile is incomplete', async () => {
    mockGetCurrentUser.mockResolvedValue({
      data: {
        data: {
          fullName: '', // Incomplete profile
        },
      },
    } as any);

    renderSidebar();

    await waitFor(() => {
      const profileButton = screen.getByText('Profile').closest('button');
      expect(profileButton).toHaveClass('cursor-not-allowed');
    });
  });

  it('should handle API error gracefully', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('API Error'));

    renderSidebar();

    await waitFor(() => {
      // Component should still render even if API fails
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});

