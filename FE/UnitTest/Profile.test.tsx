import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../src/source/page/Patient/Profile';
import { userAPI } from '../src/source/page/Axios/Axios';
import { useGlobalTheme } from '../src/contexts/GlobalThemeContext';

// Mock dependencies
jest.mock('../src/source/page/Axios/Axios', () => ({
  userAPI: {
    getCurrentUser: jest.fn(),
    updateProfile: jest.fn(),
    uploadAvatar: jest.fn(),
  },
}));

jest.mock('../src/contexts/GlobalThemeContext', () => ({
  useGlobalTheme: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock global fetch for Cloudinary upload
(global as any).fetch = jest.fn();

const mockGetCurrentUser = userAPI.getCurrentUser as jest.MockedFunction<typeof userAPI.getCurrentUser>;
const mockUpdateProfile = userAPI.updateProfile as jest.MockedFunction<typeof userAPI.updateProfile>;
const mockUseGlobalTheme = useGlobalTheme as jest.MockedFunction<typeof useGlobalTheme>;

const renderProfile = () => {
  return render(
    <BrowserRouter>
      <Profile />
    </BrowserRouter>
  );
};

describe('Profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGlobalTheme.mockReturnValue({
      isDarkMode: false,
      toggleTheme: jest.fn(),
    });
  });

  it('should render profile component', async () => {
    mockGetCurrentUser.mockResolvedValue({
      data: {
        data: {
          userid: 'user123',
          fullName: 'Test User',
          email: 'test@test.com',
        },
      },
    } as any);

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    });
  });

  it('should update profile when form is submitted', async () => {
    mockGetCurrentUser.mockResolvedValue({
      data: {
        data: {
          userid: 'user123',
          fullName: 'Test User',
          email: 'test@test.com',
          phoneNumber: '1234567890',
          dateOfBirth: '1990-01-01',
          age: 33,
          gender: 'Male',
          address: '123 Test St',
          identifyNumber: '123456789012',
        },
      },
    } as any);

    mockUpdateProfile.mockResolvedValue({
      data: { success: true },
    } as any);

    renderProfile();

    await waitFor(() => {
      const editButton = screen.getByText(/Edit/i);
      fireEvent.click(editButton);
    });

    await waitFor(() => {
      const fullNameInput = screen.getByDisplayValue(/Test User/i);
      fireEvent.change(fullNameInput, { target: { value: 'Updated Name' } });
    });

    await waitFor(() => {
      const saveButton = screen.getByText(/Update Profile/i);
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
    });
  });

  it('should handle API error', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('API Error'));

    renderProfile();

    await waitFor(() => {
      // Component should still render even if API fails
      expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    });
  });
});

  