import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ProfessionalImageViewer } from '@/components/ProfessionalImageViewer';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn()
}));

describe('ProfessionalImageViewer Mobile Optimization', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    imageUrl: 'data:image/png;base64,test',
    title: 'Test Image',
    description: 'Test Description'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders compact header on mobile', () => {
    vi.mocked(require('@/hooks/use-mobile')).useIsMobile.mockReturnValue(true);
    
    render(<ProfessionalImageViewer {...defaultProps} />);
    
    // Check for mobile-specific classes
    const header = document.querySelector('.p-2.h-12');
    expect(header).toBeInTheDocument();
  });

  test('renders full header on desktop', () => {
    vi.mocked(require('@/hooks/use-mobile')).useIsMobile.mockReturnValue(false);
    
    render(<ProfessionalImageViewer {...defaultProps} />);
    
    // Check for desktop-specific classes
    const header = document.querySelector('.p-4.h-16');
    expect(header).toBeInTheDocument();
  });

  test('mobile controls have proper touch target sizes', () => {
    vi.mocked(require('@/hooks/use-mobile')).useIsMobile.mockReturnValue(true);
    
    render(<ProfessionalImageViewer {...defaultProps} />);
    
    // Check for minimum touch target size (44x44px)
    const buttons = document.querySelectorAll('.min-h-\\[44px\\].min-w-\\[44px\\]');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('shows overflow menu on mobile', () => {
    vi.mocked(require('@/hooks/use-mobile')).useIsMobile.mockReturnValue(true);
    
    render(<ProfessionalImageViewer {...defaultProps} />);
    
    // Should have more options button
    expect(screen.getByLabelText('More options')).toBeInTheDocument();
  });

  test('shows all controls on desktop', () => {
    vi.mocked(require('@/hooks/use-mobile')).useIsMobile.mockReturnValue(false);
    
    render(<ProfessionalImageViewer {...defaultProps} />);
    
    // Should have individual control buttons
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
    expect(screen.getByLabelText('Rotate image')).toBeInTheDocument();
  });

  test('maintains accessibility on mobile', () => {
    vi.mocked(require('@/hooks/use-mobile')).useIsMobile.mockReturnValue(true);
    
    render(<ProfessionalImageViewer {...defaultProps} />);
    
    // Check for proper aria labels
    expect(screen.getByLabelText('Download image')).toBeInTheDocument();
    expect(screen.getByLabelText('More options')).toBeInTheDocument();
    expect(screen.getByLabelText('Close viewer')).toBeInTheDocument();
  });
});