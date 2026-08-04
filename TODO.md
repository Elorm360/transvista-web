# TransVista Experience Card Image Integration — Task Tracker

## Objective
Replace the placeholder visuals in the Experiences section with real destination images, adding an `image` field to the data file and rendering it in the ExperienceCard with a premium editorial layout (image, gradient overlay, category pill, hover zoom).

## Steps
- [x] 1. Analyze the Experiences data file, card component, and parent component
- [x] 2. Identify the placeholder block in `ExperienceCard.tsx` to replace
- [x] 3. Get plan approval from user
- [x] 4. Add `image` field to `Experience` interface and each item in `content/experiences.ts`
- [x] 5. Update `ExperienceCard.tsx` to render the image (fill, object-cover, hover zoom, gradient overlay) and move category to a pill on the image
- [x] 6. Pass `image` through `Experiences.tsx`
- [x] 7. Verify the build / type check passes
