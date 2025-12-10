# Future Flow: Academic Alignment System - Design Guidelines

## Design Philosophy
Professional academic-tech aesthetic that is **clean, modern, minimal but informative, structured but smooth**. The UI empowers students by presenting their academic journey visually without overwhelming them.

## Color Palette

**Primary Colors:**
- Background: `#FFFFFF` (White)
- Accents/Borders: `#B78656` (Warm Brown) - for card outlines, dividers, borders
- Highlights: `#FF9C42` (Orange) - for chips, labels, section headers
- CTA Primary: `#FFD34E` (Yellow) - all primary buttons
- CTA Secondary: `#FFA135` (Orange) - borders for secondary buttons

**Supporting Colors:**
- Text: `#1A1A1A` (Black)
- Headings: `#3A3A3A` (Dark Gray)
- Background Panels: `#EFEFEF` (Soft Gray)
- Links/Notifications: `#4285F4` (Blue)
- Neutral Buttons: Light gray background

## Typography
- **Primary Font:** Poppins (headings, labels, UI elements)
- **Secondary Font:** Inter (body text, descriptions)
- **Hierarchy:** Headings (semi-bold), Body (regular), Labels (medium), Analytics Numbers (bold)
- **Base Size:** 14-18px

## Layout System

**Global Structure:**
- **Left Sidebar Navigation** (persistent): Dashboard, Profile, Goals, Academic Alignment, Careers, Opportunities, Resources, Progress
- **Top Header:** User profile dropdown, notifications, page title
- **Main Content Area:** Large scrollable workspace with generous padding
- **Right Quick Panel** (contextual): Suggested resources, quick actions, reminders

**Spacing System:**
- Standard padding: `24px` throughout
- Use Tailwind units: `p-6, gap-6, space-y-6` for consistency
- Grid: 12-column responsive grid
- Component spacing: `gap-4` to `gap-8` based on density

**Component Corners:**
- Cards/Panels: `rounded-lg` to `rounded-xl`
- Buttons: `rounded-md`
- Input fields: `rounded-md`

## Component Design

**Cards** (heavily used throughout):
- White background with warm brown border (`#B78656`)
- Subtle shadow for depth
- Used for: career recommendations, goal cards, resource items, analytics blocks, profile sections

**Buttons:**
- Primary: Yellow background (`#FFD34E`), bold labels, rounded
- Secondary: Orange border (`#FFA135`), transparent bg, orange text
- Neutral: Light gray background for tertiary actions
- Blurred backgrounds when placed over images

**Input Fields:**
- Clean gray borders with rounded corners
- Active state: Yellow glow/border
- Labels above inputs
- Clear error states in red

**Charts & Data Visualization:**
- Line charts: Progress tracking, skill growth over time
- Bar charts: Skill distribution, module completion
- Donut charts: Goal completion percentages
- Use warm color palette (browns, oranges, yellows)

## Module-Specific Layouts

**Dashboard:**
- Grid of stat cards (4 columns on desktop, 2 on tablet, 1 on mobile)
- Yellow highlights for quick stats
- Recent activity feed
- Quick action buttons

**Student Profile:**
- Two-column layout: Left (personal info, upload section), Right (skills, interests, documents list)
- Editable cards with inline editing
- Document upload zone with drag-and-drop

**Goals Module:**
- Goal cards in masonry/grid layout
- Progress bars within each card
- SMART goal template form in modal
- Timeline view option

**Career Pathways:**
- Large career cards with icons
- Detailed view: split layout (job overview left, skills/roadmap right)
- Visual learning pathway with connected nodes

**Opportunities:**
- List/grid toggle view
- Filter sidebar (location, industry, skills)
- Bookmark icon on each card
- Tags for required skills (orange chips)

**Resource Library:**
- Categorized grid with search
- PDF thumbnail previews
- Download buttons
- Tag-based filtering

**Progress Dashboard:**
- Multi-chart layout
- Visual timeline
- Skill radar/spider chart
- Personalized feedback cards

**Admin Panel:**
- Data tables with search/filter
- CRUD modals
- Analytics dashboard with multiple chart types
- Student monitoring view

## Interaction Design
- Smooth hover animations (scale, shadow increase)
- Modal pop-ups for forms (editing, uploads, goal creation)
- Toast notifications (success: green, error: red)
- Auto-save indicators for forms
- Skeleton loaders during data fetch

## Icons & Visual Elements
- Rounded, modern flat icons (consistent line width)
- Icons for: navigation items, skills, goal types, categories, analytics
- Flow arrow motif in branding
- Visual learning pathways with connecting lines

## Images
**Hero Image:** Not required - the dashboard is content-first. Replace traditional hero with an impactful stats overview grid and welcome message.

**Supporting Images:**
- Career pathway icons/illustrations
- Skill category icons
- Placeholder avatars for profiles
- Achievement badges/icons

## Accessibility
- High contrast mode toggle
- Keyboard navigation support
- Alt text for all images
- Scalable fonts with zoom support
- Clear focus states (yellow outline)

## Brand Expression
Every module should feel cohesive through consistent use of warm brown borders, yellow CTAs, and clean card-based layouts. The system should feel like an empowering academic companion, not a rigid administrative tool.