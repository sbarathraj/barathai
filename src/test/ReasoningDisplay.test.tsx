import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReasoningDisplay } from '@/components/ReasoningDisplay';

describe('ReasoningDisplay', () => {
  const mockReasoning = "User asks \"How are you\". We respond friendly.";
  const mockReasoningDetails = [
    {
      text: "User asks \"How are you\". We respond friendly.",
      type: "reasoning.text",
      index: 0,
      format: "unknown"
    }
  ];

  it('renders nothing when no reasoning data is provided', () => {
    const { container } = render(<ReasoningDisplay />);
    expect(container.firstChild).toBeNull();
  });

  it('renders reasoning display when reasoning is provided', () => {
    render(<ReasoningDisplay reasoning={mockReasoning} />);
    expect(screen.getByText('🧠 AI Reasoning')).toBeInTheDocument();
  });

  it('shows step count correctly', () => {
    render(<ReasoningDisplay reasoningDetails={mockReasoningDetails} />);
    expect(screen.getByText('1 step')).toBeInTheDocument();
  });

  it('expands and collapses reasoning details', () => {
    render(<ReasoningDisplay reasoning={mockReasoning} />);
    
    const toggleButton = screen.getByRole('button');
    
    // Initially collapsed
    expect(screen.queryByText('Primary Reasoning:')).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(toggleButton);
    expect(screen.getByText('Primary Reasoning:')).toBeInTheDocument();
    expect(screen.getByText(mockReasoning)).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(toggleButton);
    expect(screen.queryByText('Primary Reasoning:')).not.toBeInTheDocument();
  });

  it('renders detailed reasoning steps', () => {
    render(
      <ReasoningDisplay 
        reasoning={mockReasoning}
        reasoningDetails={mockReasoningDetails}
      />
    );
    
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Detailed Analysis:')).toBeInTheDocument();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();
  });
});