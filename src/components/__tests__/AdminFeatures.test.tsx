import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Settings from '@/pages/Settings';

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    updateUser: vi.fn()
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null }),
        head: vi.fn().mockResolvedValue({ count: 0 }),
        limit: vi.fn().mockResolvedValue({ data: [] }),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis()
      })
    }),
    upsert: vi.fn().mockResolvedValue({ error: null })
  })
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

const SettingsWrapper = () => (
  <BrowserRouter>
    <Settings />
  </BrowserRouter>
);

describe('Admin Features Access Control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows admin features for admin user (jcibarathraj@gmail.com)', async () => {
    // Mock admin user session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'admin-user-id',
            email: 'jcibarathraj@gmail.com'
          }
        }
      }
    });

    render(<SettingsWrapper />);

    // Wait for component to load
    await screen.findByText('Settings');

    // Admin should see Usage Statistics (when data loads)
    // Note: The component will try to fetch usage stats for admin
    expect(mockSupabase.from).toHaveBeenCalledWith('api_usage_logs');
  });

  it('hides admin features for regular user', async () => {
    // Mock regular user session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'regular-user-id',
            email: 'regular@example.com'
          }
        }
      }
    });

    render(<SettingsWrapper />);

    // Wait for component to load
    await screen.findByText('Settings');

    // Regular user should NOT trigger usage stats fetch
    // The component should not call fetchUsageStats for non-admin users
    const apiUsageCalls = mockSupabase.from.mock.calls.filter(
      call => call[0] === 'api_usage_logs'
    );
    
    // Should only be called for profiles, not for usage stats
    expect(apiUsageCalls.length).toBe(0);
  });

  it('shows change password feature for all users', async () => {
    // Mock any user session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'any-user-id',
            email: 'any@example.com'
          }
        }
      }
    });

    render(<SettingsWrapper />);

    // Wait for component to load
    await screen.findByText('Settings');

    // All users should see Change Password button
    expect(screen.getByText('Change Password')).toBeInTheDocument();
  });

  it('shows security section for all users', async () => {
    // Mock any user session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'any-user-id',
            email: 'any@example.com'
          }
        }
      }
    });

    render(<SettingsWrapper />);

    // Wait for component to load
    await screen.findByText('Settings');

    // All users should see Security section and Delete Account
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Delete Account')).toBeInTheDocument();
  });
});