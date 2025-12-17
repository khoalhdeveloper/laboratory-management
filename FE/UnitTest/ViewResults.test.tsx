import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ViewResultsModal from '../src/source/page/Patient/ViewResults';
import { useGlobalTheme } from '../src/contexts/GlobalThemeContext';
import { exportTestResultsToPDFHTML } from '../src/utils/exportUtils';
import { toast } from '../src/utils/toast';

// Mock dependencies
jest.mock('../src/contexts/GlobalThemeContext', () => ({
  useGlobalTheme: jest.fn(),
}));

jest.mock('../src/utils/exportUtils', () => ({
  exportTestResultsToPDFHTML: jest.fn(),
}));

jest.mock('../src/utils/toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockUseGlobalTheme = useGlobalTheme as jest.MockedFunction<typeof useGlobalTheme>;
const mockExportPDF = exportTestResultsToPDFHTML as jest.MockedFunction<typeof exportTestResultsToPDFHTML>;
const mockToast = toast as any;

describe('ViewResultsModal', () => {
  const mockOnClose = jest.fn();
  const mockUserData = {
    userid: 'user123',
    fullName: 'Test User',
  };

  const mockTestReport = {
    id: 'test1',
    orderId: 'ORD001',
    patientId: 'patient123',
    patientName: 'Test User',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    phoneNumber: '1234567890',
    testType: 'Blood Test',
    department: 'Laboratory',
    status: 'Completed',
    resultDate: new Date().toISOString(),
    priority: 'Normal',
    doctor: 'Dr. Smith',
    completionTime: new Date().toISOString(),
    results: {
      hemoglobin: { value: 14.5, normalRange: { min: 12, max: 16 }, unit: 'g/dL' },
    },
    instrumentName: 'Test Instrument',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGlobalTheme.mockReturnValue({
      isDarkMode: false,
      toggleTheme: jest.fn(),
    });
  });

  it('should render when isOpen is true', () => {
    render(
      <ViewResultsModal
        isOpen={true}
        onClose={mockOnClose}
        testReport={mockTestReport}
        userData={mockUserData}
      />
    );

    expect(screen.getByText(/Test Results Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Blood Test/i)).toBeInTheDocument();
  });

  it('should export PDF successfully', async () => {
    mockExportPDF.mockResolvedValue({ success: true } as any);

    render(
      <ViewResultsModal
        isOpen={true}
        onClose={mockOnClose}
        testReport={mockTestReport}
        userData={mockUserData}
      />
    );

    const exportButton = screen.getByText(/Export PDF/i);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockExportPDF).toHaveBeenCalledWith(mockTestReport, mockUserData);
      expect(mockToast.success).toHaveBeenCalledWith('Test results exported to PDF successfully!');
    });
  });

  it('should handle export error gracefully', async () => {
    mockExportPDF.mockRejectedValue(new Error('Network error'));

    render(
      <ViewResultsModal
        isOpen={true}
        onClose={mockOnClose}
        testReport={mockTestReport}
        userData={mockUserData}
      />
    );

    const exportButton = screen.getByText(/Export PDF/i);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to export test results');
    });
  });
});

