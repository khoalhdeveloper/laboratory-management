import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ChangePassword from '../src/source/page/Patient/ChangePassword';
import { userAPI } from '../src/source/page/Axios/Axios';
import { useGlobalTheme } from '../src/contexts/GlobalThemeContext';

// Mock dependencies
jest.mock('../src/source/page/Axios/Axios', () => ({
  userAPI: {
    changePassword: jest.fn(),
  },
}));

jest.mock('../src/contexts/GlobalThemeContext', () => ({
  useGlobalTheme: jest.fn(),
}));

const mockChangePassword = userAPI.changePassword as jest.MockedFunction<typeof userAPI.changePassword>;
const mockUseGlobalTheme = useGlobalTheme as jest.MockedFunction<typeof useGlobalTheme>;

describe('ChangePassword', () => {
  const mockShowNotification = jest.fn();
  const mockCurrentUser = {
    _id: 'user123',
    userid: 'user123',
    fullName: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGlobalTheme.mockReturnValue({
      isDarkMode: false,
      toggleTheme: jest.fn(),
    });
  });

  it('should render change password form', () => {
    render(
      <ChangePassword
        currentUser={mockCurrentUser}
        showNotification={mockShowNotification}
      />
    );

    expect(screen.getByText(/Change Password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your current password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your new password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Confirm your new password/i)).toBeInTheDocument();
  });

  it('should successfully change password with valid input', async () => {
    mockChangePassword.mockResolvedValue({} as any);

    render(
      <ChangePassword
        currentUser={mockCurrentUser}
        showNotification={mockShowNotification}
      />
    );

    const currentPasswordInput = screen.getByPlaceholderText(/Enter your current password/i);
    const newPasswordInput = screen.getByPlaceholderText(/Enter your new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/Confirm your new password/i);

    fireEvent.change(currentPasswordInput, { target: { value: 'OldPass123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'NewPass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPass123' } });

    const submitButton = screen.getByRole('button', { name: /change password/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith('user123', {
        oldPassword: 'OldPass123',
        newPassword: 'NewPass123',
      });
      expect(mockShowNotification).toHaveBeenCalledWith('Password changed successfully!', 'success');
    });
  });

  it('should handle API error', async () => {
    mockChangePassword.mockRejectedValue({
      response: {
        status: 400,
        data: { message: 'Current password is incorrect' },
      },
    } as any);

    render(
      <ChangePassword
        currentUser={mockCurrentUser}
        showNotification={mockShowNotification}
      />
    );

    const currentPasswordInput = screen.getByPlaceholderText(/Enter your current password/i);
    const newPasswordInput = screen.getByPlaceholderText(/Enter your new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/Confirm your new password/i);

    fireEvent.change(currentPasswordInput, { target: { value: 'WrongPass123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'NewPass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPass123' } });

    const submitButton = screen.getByRole('button', { name: /change password/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalled();
    });
  });
});

