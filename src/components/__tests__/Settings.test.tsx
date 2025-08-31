import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Settings from '@/pages/Settings';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com'
            }
          }
        }
      })
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'test-user-id',
              full_name: 'Test User',
              email: 'test@example.com',
              created_at: '2024-01-01T00:00:00Z'
            }
          })
        }),
        limit: vi.fn().mockResolvedValue({
          data: []
        }),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        head: vi.fn().mockReturnThis()
      }),
      upsert: vi.fn().mockResolvedValue({ error: null })
    })
  }
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock useRealtimeUsage
vi.mock('@/hooks/useRealtimeUsage', () => ({
  useRealtimeUsage: () => ({
    usage: {
      totalApiCalls: 150,
      totalImages: 25,
      todayApiCalls: 12,
      todayImages: 3,
      thisWeekApiCalls: 89,
      thisWeekImages: 15,
      avgResponseTime: 245,
      successRate: 98,
      lastUpdated: new Date()
    },
    loading: false,
    error: null,
    refresh: vi.fn()
  })
}));

const SettingsWrapper = () => (
  <BrowserRouter>
    <Settings />
  </BrowserRouter>
);

describe('Settings Page', () => {
  it('renders settings page with main sections', async () => {
    render(<SettingsWrapper />);
    
    // Check if main sections are present
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Usage Statistics')).toBeInTheDocument();
  });

  it('displays user profile information', async () => {
    render(<SettingsWrapper />);
    
    // Should show email
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows usage statistics', async () => {
    render(<SettingsWrapper />);
    
    // Should display usage numbers
    expect(screen.getByText('150')).toBeInTheDocument(); // Total API calls
    expect(screen.getByText('25')).toBeInTheDocument();  // Total images
    expect(screen.getByText('98%')).toBeInTheDocument(); // Success rate
  });

  it('has theme toggle functionality', async () => {
    render(<SettingsWrapper />);
    
    // Should have theme-related elements
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });

  it('displays quick actions', async () => {
    render(<SettingsWrapper />);
    
    // Should show quick action buttons
    expect(screen.getByText('Start New Chat')).toBeInTheDocument();
    expect(screen.getByText('View Analytics')).toBeInTheDocument();
  });
});