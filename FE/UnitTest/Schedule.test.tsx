import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PatientSchedule from '../src/source/page/Patient/Schedule';
import { api } from '../src/source/page/Axios/Axios';
import dayjs from 'dayjs';

// Mock dependencies
jest.mock('../src/source/page/Axios/Axios', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Modal: ({ children, visible }: any) => visible ? <div data-testid="modal">{children}</div> : null,
  Form: {
    useForm: () => [
      {
        validateFields: jest.fn().mockResolvedValue({}),
        resetFields: jest.fn(),
        getFieldsValue: jest.fn(),
        getFieldValue: jest.fn().mockReturnValue(null),
        setFieldsValue: jest.fn(),
      },
    ],
  },
  DatePicker: ({ onChange }: any) => <input data-testid="date-picker" onChange={(e) => onChange && onChange(dayjs(e.target.value))} />,
  Select: ({ children, onChange, ...props }: any) => (
    <select data-testid="select" onChange={(e) => onChange && onChange(e.target.value)} {...props}>
      {children}
    </select>
  ),
  Input: {
    TextArea: ({ onChange, ...props }: any) => (
      <textarea data-testid="textarea" onChange={(e) => onChange && onChange(e.target.value)} {...props} />
    ),
  },
}));

const mockApiGet = api.get as jest.MockedFunction<typeof api.get>;

const renderSchedule = () => {
  return render(
    <BrowserRouter>
      <PatientSchedule />
    </BrowserRouter>
  );
};

describe('PatientSchedule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render schedule component', async () => {
    mockApiGet
      .mockResolvedValueOnce({ data: [] } as any) // nurses
      .mockResolvedValueOnce({ data: [] } as any); // consultations

    renderSchedule();

    await waitFor(() => {
      expect(screen.getByText(/Book Consultation/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display consultations when loaded', async () => {
    const mockConsultations = [
      {
        consultationId: 'consult1',
        userid: 'user123',
        nurseId: 'nurse1',
        nurseName: 'Nurse Smith',
        scheduledTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'approved',
      },
    ];

    const mockNurses = [
      {
        userid: 'nurse1',
        username: 'nurse1',
        fullName: 'Nurse Smith',
        email: 'nurse@test.com',
      },
    ];

    mockApiGet
      .mockResolvedValueOnce({ data: mockNurses } as any) // nurses
      .mockResolvedValueOnce({ data: mockConsultations } as any); // consultations

    renderSchedule();

    // Wait for component to load and render
    await waitFor(() => {
      // Nurse name should appear either in doctors list or consultations table
      const nurseElements = screen.queryAllByText(/Nurse Smith/i);
      expect(nurseElements.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it('should handle API error', async () => {
    mockApiGet
      .mockRejectedValueOnce(new Error('API Error'));

    renderSchedule();

    await waitFor(() => {
      // Component should handle error gracefully
      expect(screen.getByText(/Book Consultation/i)).toBeInTheDocument();
    });
  });
});

