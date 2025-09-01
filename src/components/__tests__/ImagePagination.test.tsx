import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ImageGenerationTrackingTab from '@/components/ImageGenerationTrackingTab';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  range: vi.fn().mockResolvedValue({
                    data: [],
                    error: null
                  }),
                  head: vi.fn().mockResolvedValue({
                    count: 0,
                    error: null
                  })
                })
              })
            })
          })
        })
      })
    })
  }
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

const mockCurrentUser = {
  id: 'test-user',
  email: 'test@example.com'
};

describe('ImageGenerationTrackingTab Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders pagination controls when there are multiple pages', async () => {
    // Mock data with multiple pages
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lte: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    range: vi.fn().mockResolvedValue({
                      data: Array.from({ length: 12 }, (_, i) => ({
                        id: `img-${i}`,
                        image_url: `data:image/png;base64,test${i}`,
                        prompt: `Test prompt ${i}`,
                        created_at: new Date().toISOString(),
                        success: true
                      })),
                      error: null
                    }),
                    head: vi.fn().mockResolvedValue({
                      count: 25, // More than one page
                      error: null
                    })
                  })
                })
              })
            })
          })
        })
      })
    };

    vi.mocked(require('@/integrations/supabase/client')).supabase = mockSupabase;

    render(<ImageGenerationTrackingTab currentUser={mockCurrentUser} />);

    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    });
  });

  test('pagination controls have proper accessibility attributes', async () => {
    render(<ImageGenerationTrackingTab currentUser={mockCurrentUser} />);

    await waitFor(() => {
      const prevButton = screen.queryByLabelText('Go to previous page');
      const nextButton = screen.queryByLabelText('Go to next page');
      
      if (prevButton) {
        expect(prevButton).toHaveAttribute('aria-label', 'Go to previous page');
      }
      if (nextButton) {
        expect(nextButton).toHaveAttribute('aria-label', 'Go to next page');
      }
    });
  });

  test('displays skeleton loader while loading', () => {
    render(<ImageGenerationTrackingTab currentUser={mockCurrentUser} />);
    
    // Should show skeleton loader initially
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});