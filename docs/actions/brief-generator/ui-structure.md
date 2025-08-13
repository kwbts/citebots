# Content Brief Generator UI Structure

Based on the requirement to have separate pages for each step of the process, we will implement the following UI structure:

## Page 1: Brief Setup Page (`/dashboard/actions/content-brief`)

This page will focus exclusively on setting up the brief parameters and initiating the generation process.

### UI Components:

1. **Header Section**
   - Title: "Content Brief Generator"
   - Subtitle: Brief explanation of the feature

2. **Brief Parameters Form**
   - Client Selection (dropdown with search)
   - Title / Working Title (text input)
   - Keywords (tag-based input)
   - Purpose Selection (radio buttons with descriptions)
   - Target Audience Selection (radio buttons with descriptions)
   - Style Guide (textarea with formatting)
   - Custom Instructions (textarea)

3. **Generation Options**
   - Research Depth (standard/comprehensive toggle)
   - Platform Selection (checkboxes for Google, ChatGPT, Perplexity)

4. **Generate Button**
   - Clear, prominent call-to-action
   - Visual loading state for submission

5. **Information Section**
   - Brief explanation of the process
   - Expected timeline for generation

### User Flow:
1. User fills in required parameters
2. User clicks "Generate Content Brief" button
3. System shows loading state and begins processing
4. Upon completion, user is redirected to the results page

## Page 2: Brief Results Page (`/dashboard/actions/content-brief/view/[id]`)

This page will display the generated brief in a structured, easy-to-navigate format.

### UI Components:

1. **Header Section**
   - Brief title
   - Client name
   - Generation date
   - Keywords used

2. **Action Toolbar**
   - Export options (PDF, DOCX, Markdown)
   - Copy to clipboard button
   - Share link button
   - Print button
   - Edit/regenerate button

3. **Navigation Sidebar**
   - Table of contents with anchor links
   - Quick jump to sections

4. **Content Sections (Tabbed Interface)**
   
   **Tab 1: Overview**
   - Brief summary
   - Key metrics from generation
   - Content suggestions
   
   **Tab 2: Table of Contents**
   - Complete structured TOC with explanatory bullets
   - Visual hierarchy of sections
   
   **Tab 3: Research**
   - Research links with descriptions
   - Source credibility indicators
   - Citation formatting options
   
   **Tab 4: Competitor Analysis**
   - Insights from competitor content
   - Opportunity areas
   
   **Tab 5: Process Notes**
   - Details about the generation process
   - Queries used
   - Platforms analyzed

5. **Related Briefs Section**
   - Other briefs for the same client
   - Similar briefs by topic/keyword

### User Flow:
1. User is directed to this page after generation completes
2. User can navigate between different sections of the brief
3. User can export, share, or print the brief
4. User can navigate back to the setup page to create a new brief

## Transition Between Pages

### Loading/Processing UI:
- After submitting the form on Page 1, show a processing screen
- Display real-time progress of the generation steps
- Automatically redirect to Page 2 when complete
- Handle errors gracefully with retry options

### URL Structure:
- Setup page: `/dashboard/actions/content-brief`
- Results page: `/dashboard/actions/content-brief/view/[id]`
- The `[id]` parameter will be the unique identifier for the generated brief

## Responsive Considerations

Both pages will be fully responsive:

- **Mobile View**:
  - Single column layout
  - Collapsible sections
  - Bottom navigation bar for tabs
  
- **Tablet View**:
  - Adaptive two-column layout
  - Slide-out navigation
  
- **Desktop View**:
  - Full multi-column layout
  - Fixed position navigation elements

## Accessibility Features

- Proper heading hierarchy
- ARIA labels for all interactive elements
- Keyboard navigation support
- High contrast mode compatibility
- Screen reader optimizations

## Implementation Approach

1. First, refactor the existing content-brief.vue into the setup-only page
2. Create a new view.vue page for displaying results
3. Implement the router configuration for the new page structure
4. Design shared components between both pages
5. Implement state management for passing data between pages