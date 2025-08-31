import React from 'react';
import { render } from '@testing-library/react';
import { ProfessionalImageViewer } from '../ProfessionalImageViewer';
import { ProfessionalImageGallery } from '../ProfessionalImageGallery';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('Professional Image Components', () => {
  test('ProfessionalImageViewer renders without crashing', () => {
    const mockProps = {
      isOpen: false,
      onClose: jest.fn(),
      imageUrl: null,
      title: 'Test Image',
      description: 'Test Description'
    };
    
    expect(() => render(<ProfessionalImageViewer {...mockProps} />)).not.toThrow();
  });

  test('ProfessionalImageGallery renders without crashing', () => {
    const mockProps = {
      images: [],
      onImageClick: jest.fn(),
      title: 'Test Gallery',
      showUserInfo: false,
      columns: 3
    };
    
    expect(() => render(<ProfessionalImageGallery {...mockProps} />)).not.toThrow();
  });
});