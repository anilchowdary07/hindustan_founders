# LinkedIn UI Components

This directory contains a collection of React components that follow LinkedIn's mobile design system. These components are designed to be used together to create a consistent and familiar user experience.

## Components

### LinkedInAvatar

A customizable avatar component that supports different sizes, verification badges, and online status indicators.

```tsx
<LinkedInAvatar
  src="/path/to/avatar.jpg"
  alt="User Name"
  fallback="UN"
  size="md"
  verified
  status="online"
  statusPosition="bottom-right"
  onClick={() => navigate("/profile")}
/>
```

### LinkedInButton

A button component with various styles and states that match LinkedIn's design.

```tsx
<LinkedInButton
  variant="primary" // primary, secondary, outline, ghost, text
  size="md" // sm, md, lg
  fullWidth
  isLoading={false}
  icon={<UserPlus className="h-4 w-4" />}
  iconPosition="left" // left, right
  rounded="md" // none, sm, md, lg, full
  onClick={() => console.log("Button clicked")}
>
  Connect
</LinkedInButton>
```

### LinkedInCard

A card component with header, content, footer, and action sections.

```tsx
<LinkedInCard>
  <LinkedInCardHeader>
    <h3>Card Title</h3>
  </LinkedInCardHeader>
  <LinkedInCardContent>
    <p>Card content</p>
  </LinkedInCardContent>
  <LinkedInCardFooter>
    <LinkedInButton>Action</LinkedInButton>
  </LinkedInCardFooter>
</LinkedInCard>
```

### LinkedInInput

A form input component with label, error, hint, and icon support.

```tsx
<LinkedInInput
  label="Email"
  placeholder="Enter your email"
  error="Invalid email address"
  hint="We'll never share your email"
  leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
  rightIcon={<X className="h-5 w-5 text-gray-400" />}
  onRightIconClick={() => setValue("")}
/>
```

### LinkedInPostCard

A social media post card component with engagement actions.

```tsx
<LinkedInPostCard
  author={{
    name: "John Doe",
    title: "Software Engineer at Company",
    avatarUrl: "/path/to/avatar.jpg",
    verified: true
  }}
  content="This is a post content"
  timestamp={new Date()}
  likes={42}
  comments={5}
  shares={2}
  images={["/path/to/image.jpg"]}
  onLike={() => console.log("Like")}
  onComment={() => console.log("Comment")}
  onShare={() => console.log("Share")}
  onSend={() => console.log("Send")}
/>
```

### LinkedInSearch

A search component with dropdown results and full-screen mode.

```tsx
<LinkedInSearch
  placeholder="Search"
  onSearch={(query) => console.log(query)}
  results={[
    { id: "1", type: "user", title: "John Doe", subtitle: "Software Engineer", imageUrl: "/path/to/avatar.jpg" }
  ]}
  onResultClick={(result) => console.log(result)}
  fullScreen={false}
  onClose={() => setFullScreen(false)}
/>
```

### LinkedInSkeleton

Skeleton loaders for various content types.

```tsx
<LinkedInSkeleton variant="text" width="100%" height={20} />
<LinkedInPostSkeleton />
<LinkedInProfileSkeleton />
<LinkedInJobSkeleton />
```

### LinkedInTabs

A tabbed navigation component with various styles.

```tsx
<LinkedInTabs
  tabs={[
    { id: "all", label: "All" },
    { id: "people", label: "People", count: 42 },
    { id: "jobs", label: "Jobs" }
  ]}
  activeTab="all"
  onChange={(tabId) => setActiveTab(tabId)}
  variant="underline" // underline, pills, buttons
  scrollable
  fullWidth
/>

<LinkedInTabPanel id="all" activeTab={activeTab}>
  All content
</LinkedInTabPanel>
```

## Page Components

We've also created several page components that demonstrate how to use these UI components together:

- `LinkedInHome`: A home feed page
- `LinkedInProfile`: A user profile page
- `LinkedInNetwork`: A network/connections page
- `LinkedInNotifications`: A notifications page
- `LinkedInJobs`: A jobs page
- `LinkedInMessaging`: A messaging page

## Utilities

The components use several utility classes and styles:

- LinkedIn-specific colors are available as Tailwind classes (e.g., `bg-linkedin-blue`)
- Animation classes for transitions and loading states
- Responsive design patterns for mobile and desktop

## Best Practices

1. Use the components together for a consistent look and feel
2. Follow LinkedIn's mobile-first approach
3. Use the provided color variables for consistency
4. Ensure proper spacing between components
5. Use appropriate loading states for async operations
6. Implement proper accessibility attributes

## Customization

All components accept a `className` prop that can be used to override the default styles. Use the `cn` utility from `@/lib/utils` to merge classes:

```tsx
import { cn } from "@/lib/utils";

<LinkedInButton
  className={cn(
    "custom-class",
    someCondition && "conditional-class"
  )}
>
  Custom Button
</LinkedInButton>
```