import { render, screen, waitFor } from '@testing-library/react';
import NotificationModal from '../src/source/page/Patient/NotificationModal';
import { notificationAPI } from '../src/source/page/Axios/Axios';

// Mock the API module
jest.mock('../src/source/page/Axios/Axios', () => ({
  notificationAPI: {
    getMessagesByUserId: jest.fn(),
    readMessage: jest.fn(),
  },
}));

const mockGetMessagesByUserId = notificationAPI.getMessagesByUserId as jest.MockedFunction<typeof notificationAPI.getMessagesByUserId>;

describe('NotificationModal', () => {
  const mockOnClose = jest.fn();
  const mockUserId = 'user123';

  const mockNotifications = [
    {
      _id: '1',
      message_id: 'msg1',
      userid: mockUserId,
      title: 'Test Notification 1',
      message: 'This is a test message',
      type: 'info',
      isRead: false,
      for: 'patient',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    },
    {
      _id: '2',
      message_id: 'msg2',
      userid: mockUserId,
      title: 'Test Notification 2',
      message: 'This is another test message',
      type: 'warning',
      isRead: true,
      for: 'patient',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when isOpen is true', () => {
    mockGetMessagesByUserId.mockResolvedValue({
      data: { data: [] },
    } as any);

    render(
      <NotificationModal
        isOpen={true}
        onClose={mockOnClose}
        userId={mockUserId}
      />
    );

    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('should display notifications when loaded', async () => {
    mockGetMessagesByUserId.mockResolvedValue({
      data: { data: mockNotifications },
    } as any);

    render(
      <NotificationModal
        isOpen={true}
        onClose={mockOnClose}
        userId={mockUserId}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
      expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
    });
  });

  it('should display error message when API call fails', async () => {
    const errorMessage = 'Failed to load notifications';
    mockGetMessagesByUserId.mockRejectedValue({
      response: { data: { message: errorMessage } },
    } as any);

    render(
      <NotificationModal
        isOpen={true}
        onClose={mockOnClose}
        userId={mockUserId}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});

