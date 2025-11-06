# AI Reasoning Display Feature

## Overview

The AI Reasoning Display feature in BarathAI provides users with transparent insights into how the AI processes and analyzes their requests. This feature extracts reasoning data from OpenRouter API responses and displays it in a professional, collapsible interface.

## Features

### 🧠 **Reasoning Extraction**
- Automatically extracts `reasoning` and `reasoning_details` from API responses
- Supports multiple reasoning formats and types
- Stores reasoning data in the database for historical access

### 🎨 **Professional Display**
- Collapsible reasoning cards with step-by-step breakdown
- Color-coded reasoning types (analysis, reasoning.text, etc.)
- Smooth animations and professional styling
- Mobile-responsive design

### ⚙️ **User Control**
- Toggle reasoning display on/off in settings
- Persistent user preferences
- Real-time toggle without page refresh

### 📊 **Analytics Integration**
- Track reasoning usage and engagement
- Model-specific reasoning availability
- Performance metrics for reasoning display

## Technical Implementation

### Database Schema

```sql
-- Added to messages table
ALTER TABLE public.messages 
ADD COLUMN reasoning JSONB,
ADD COLUMN model TEXT,
ADD COLUMN usage JSONB;
```

### API Response Structure

```typescript
interface OpenRouterResponse {
  choices: [{
    message: {
      content: string;
      reasoning?: string;
      reasoning_details?: ReasoningDetail[];
    }
  }];
}

interface ReasoningDetail {
  text: string;
  type: string;
  index: number;
  format?: string;
}
```

### Components

1. **ReasoningDisplay** - Main display component
2. **ReasoningToggle** - Settings toggle component
3. **ApiResponseParser** - Response parsing utilities

## Usage Examples

### Basic Reasoning Display
```tsx
<ReasoningDisplay 
  reasoning="User asks about weather. Provide helpful response."
  reasoningDetails={[
    {
      text: "Analyze user intent for weather information",
      type: "reasoning.text",
      index: 0
    }
  ]}
/>
```

### In Chat Messages
```tsx
{reasoningEnabled && msg.reasoning && (
  <ReasoningDisplay 
    reasoning={msg.reasoning.reasoning}
    reasoningDetails={msg.reasoning.reasoning_details}
    className="mb-4"
  />
)}
```

## Configuration

### Environment Variables
No additional environment variables required. The feature uses existing OpenRouter API configuration.

### User Settings
Users can toggle reasoning display in Settings > App Preferences > AI Reasoning Display.

### Default Behavior
- Reasoning display is **enabled by default**
- Reasoning data is always stored (regardless of display setting)
- Collapsible interface starts in **collapsed state**

## Supported Models

The reasoning feature works with OpenRouter models that provide reasoning data:
- GPT-4 series models
- Claude models with reasoning
- Other models that include reasoning in responses

## Performance Considerations

### Database Impact
- Reasoning data stored as JSONB for efficient querying
- Indexed for performance with GIN index
- Minimal storage overhead (~1-2KB per reasoning response)

### UI Performance
- Lazy rendering of reasoning details
- Smooth animations with CSS transitions
- Optimized for mobile devices

### API Impact
- No additional API calls required
- Uses existing OpenRouter response data
- Fallback handling for models without reasoning

## Testing

### Unit Tests
```bash
npm run test src/test/ReasoningDisplay.test.tsx
```

### Integration Tests
- Test reasoning extraction from API responses
- Verify database storage and retrieval
- Validate user preference persistence

## Troubleshooting

### Common Issues

1. **Reasoning not displaying**
   - Check if model supports reasoning
   - Verify reasoning toggle is enabled
   - Confirm API response includes reasoning data

2. **Database errors**
   - Run migration: `npm run db:migrate`
   - Verify JSONB column exists
   - Check RLS policies

3. **Performance issues**
   - Monitor reasoning data size
   - Check database indexes
   - Optimize component rendering

### Debug Mode
Enable debug logging in development:
```typescript
console.log('Reasoning data:', msg.reasoning);
console.log('Reasoning steps:', ApiResponseParser.getReasoningStepCount(msg.reasoning));
```

## Future Enhancements

### Planned Features
- [ ] Reasoning analytics dashboard
- [ ] Export reasoning data
- [ ] Custom reasoning templates
- [ ] Reasoning search and filtering
- [ ] Multi-language reasoning support

### API Improvements
- [ ] Support for more reasoning formats
- [ ] Real-time reasoning streaming
- [ ] Reasoning confidence scores
- [ ] Interactive reasoning exploration

## Contributing

When contributing to the reasoning feature:

1. Follow existing TypeScript patterns
2. Add comprehensive tests
3. Update documentation
4. Consider mobile responsiveness
5. Test with multiple models

## License

This feature is part of BarathAI and follows the same MIT license terms.