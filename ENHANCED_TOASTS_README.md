# Enhanced Toast Notifications

Beautiful, interactive toast notifications positioned at the bottom center of the viewport, matching modern UI design patterns.

## Features

✅ **Bottom Center Positioning** - Toasts appear at the bottom center of the screen  
✅ **Distinct Visual Styles** - Each type has unique colors and icons  
✅ **Interactive Elements** - Close buttons and action buttons  
✅ **Smooth Animations** - Elegant entrance and exit animations  
✅ **Accessible** - Keyboard navigation and ARIA labels  

## Toast Types

### Success Toast
Green background with checkmark icon. Use for successful operations.

```typescript
import { toast } from "@/lib/toast";

toast.success("Campaign created successfully!");

// With description
toast.success("Campaign created successfully!", {
  description: "Your AI agent is ready to start making calls.",
  duration: 4000 // optional, default is 4000ms
});
```

### Error Toast
Red background with X icon. Includes optional "Try again" button.

```typescript
import { toast } from "@/lib/toast";

toast.error("Error Occurred");

// With description and action button
toast.error("Error Occurred", {
  description: "Failed to create campaign. Please try again.",
  duration: 6000, // optional, default is 6000ms
  action: {
    label: "Try again",
    onClick: () => handleRetry()
  }
});
```

### Warning Toast
Amber background with warning triangle icon.

```typescript
import { toast } from "@/lib/toast";

toast.warning("Campaign is pending");

// With description
toast.warning("Campaign is pending", {
  description: "Please launch the campaign to start making calls.",
  duration: 5000 // optional, default is 5000ms
});
```

### Info Toast
Blue background with info icon.

```typescript
import { toast } from "@/lib/toast";

toast.info("Webhook verified");

// With description
toast.info("Webhook verified", {
  description: "Your phone number is correctly configured.",
  duration: 5000 // optional, default is 5000ms
});
```

### Alert Toast (Special)
Amber background with alert circle icon. Use for important notifications like subscription expiry.

```typescript
import { toast } from "@/lib/toast";

toast.alert("Your subscription is about to expire in 3 days", {
  description: "Renew now to avoid any service interruptions.",
  duration: 8000, // longer duration for important alerts
  action: {
    label: "Renew",
    onClick: () => router.push("/billing")
  }
});
```

## Migration Guide

### Old (Sonner)
```typescript
import { toast } from "sonner";

toast.success("Success!");
toast.error("Error!");
```

### New (Enhanced)
```typescript
import { toast } from "@/lib/toast";

toast.success("Success!"); // Same API!
toast.error("Error!"); // Now with more styling!

// New features available:
toast.error("Error!", {
  description: "Additional context here",
  action: {
    label: "Try again",
    onClick: () => retry()
  }
});
```

## Configuration

The Toaster is configured in `app/layout.tsx`:

```typescript
<Sonner 
  position="bottom-center"
  expand={false}
  richColors={false}
  closeButton={false}
  toastOptions={{
    unstyled: true,
    classNames: {
      toast: "w-full max-w-2xl",
    },
  }}
/>
```

## Design System

### Colors
- **Success**: Green (`bg-green-50`, `border-green-200`, `text-green-900`)
- **Error**: Red (`bg-red-50`, `border-red-200`, `text-red-900`)
- **Warning**: Amber (`bg-amber-50`, `border-amber-200`, `text-amber-900`)
- **Info**: Blue (`bg-blue-50`, `border-blue-200`, `text-blue-900`)

### Icons (from lucide-react)
- **Success**: `CheckCircle`
- **Error**: `X`
- **Warning**: `AlertTriangle`
- **Info**: `Info`
- **Alert**: `AlertCircle`

### Dimensions
- **Max Width**: `max-w-2xl` (672px)
- **Icon Size**: 40px × 40px rounded container with 20px icon
- **Padding**: 16px (p-4)
- **Border**: 2px solid
- **Shadow**: `shadow-lg`

## Examples in the Codebase

### Campaign Creation Success
```typescript
toast.success("Campaign created successfully!", {
  description: "Your AI agent is ready to start making calls."
});
```

### Campaign Creation Error with Retry
```typescript
toast.error("Error Occurred", {
  description: "Failed to create campaign. Please try again.",
  action: {
    label: "Try again",
    onClick: () => handleGenerateCampaign()
  }
});
```

### Phone Number Copied
```typescript
toast.success("Phone number copied to clipboard!");
```

### Webhook Verification
```typescript
toast.success("✅ Webhook is correctly configured!");
toast.info("Webhook verified", {
  description: "Your phone number is correctly configured."
});
```

## Backwards Compatibility

The enhanced toast system maintains backwards compatibility with existing Sonner calls:

- All existing `toast.success()`, `toast.error()` calls still work
- New features are opt-in via the options parameter
- Original Sonner methods like `toast.promise()`, `toast.loading()` are still available

## Future Enhancements

Potential improvements:
- Add progress bars for long-running operations
- Sound effects for different toast types
- Undo functionality for certain actions
- Toast queue management for multiple simultaneous toasts
- Customizable positioning per toast

