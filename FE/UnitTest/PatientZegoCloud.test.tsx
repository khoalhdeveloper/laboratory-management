import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import PatientZegoCloud from '../src/source/page/Patient/PatientZegoCloud';
import { message } from 'antd';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('antd', () => ({
  message: {
    error: jest.fn(),
  },
}));

jest.mock('@zegocloud/zego-uikit-prebuilt', () => ({
  ZegoUIKitPrebuilt: {
    generateKitTokenForTest: jest.fn(() => 'mock-token'),
    create: jest.fn(() => ({
      joinRoom: jest.fn(),
      destroy: jest.fn(),
    })),
  },
}));

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;
const mockMessageError = message.error as jest.MockedFunction<typeof message.error>;

describe('PatientZegoCloud', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('userid', 'user123');
    localStorage.setItem('userName', 'Test User');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render video call container', () => {
    mockUseParams.mockReturnValue({ consultationId: 'consult123' });

    const { container } = render(
      <BrowserRouter>
        <PatientZegoCloud />
      </BrowserRouter>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should navigate away if consultationId is missing', async () => {
    mockUseParams.mockReturnValue({ consultationId: undefined });

    render(
      <BrowserRouter>
        <PatientZegoCloud />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockMessageError).toHaveBeenCalledWith('Missing information consultationId or userId!');
      expect(mockNavigate).toHaveBeenCalledWith('/patient/schedule');
    });
  });

  it('should initialize ZegoCloud with correct parameters when all data is present', async () => {
    mockUseParams.mockReturnValue({ consultationId: 'consult123' });

    const { ZegoUIKitPrebuilt } = require('@zegocloud/zego-uikit-prebuilt');

    render(
      <BrowserRouter>
        <PatientZegoCloud />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(ZegoUIKitPrebuilt.generateKitTokenForTest).toHaveBeenCalled();
    }, { timeout: 2000 });
  });
});

