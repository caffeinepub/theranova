# TheraNova

## Current State

The Eye Control Module (`EyeControlModule.tsx`) has:
- A collapsible info panel with 3 tabs: "Why This", "How It Works", "Who Can Use This"
- "How It Works" tab has 5 steps (camera → cursor → virtual keyboard → dwell select → TTS)
- "Who Can Use" tab has 5 user-type cards
- Dwell-to-Click settings panel (toggle + slider)
- Composed text area with Speak and Clear buttons
- Virtual Keyboard component

The existing "How It Works" tab covers gaze-to-cursor flow at a high level but lacks the detailed breakdown of:
- The 4 detection components (Camera, Eye Detection Algorithm, Pupil Tracking, Gaze Estimation)
- Step-by-step cursor movement with directional examples (pupil left → look left → cursor left)
- Technologies Used section (Computer Vision, OpenCV, Dlib, Machine Learning)
- The "letter A click" example walkthrough (5-step dwell example)

## Requested Changes (Diff)

### Add
- **"How Cursor Moves" section** inside the "How It Works" tab: a visual explainer showing that gaze direction maps to cursor direction (look left → cursor left, look right → cursor right, etc.) with a directional arrow diagram
- **4 Detection Components cards** inside the "How It Works" tab: Camera (Webcam), Eye Detection Algorithm, Pupil Tracking, Gaze Estimation — each with icon, title, and description
- **Step-by-step working** subsection inside "How It Works": 5 detailed steps (Camera Captures Face → Eye Detection → Pupil Detection → Eye Direction Calculation → Cursor Movement) with the pupil-position directional table
- **Technologies Used** card inside "How It Works" tab: Computer Vision, Eye Tracking Algorithms, OpenCV, Dlib Facial Landmark Detection, Machine Learning — displayed as badge chips or icon list
- **Dwell Example walkthrough** ("Letter A" scenario) — visual step-by-step flow showing: user looks at A → camera detects → cursor moves → 2-second dwell → system selects A

### Modify
- "How It Works" tab content — expand from 5 simple steps to the full rich breakdown described above, organized into clear subsections with visual dividers
- The existing "Example" box (HELLO letters) — keep it but move it after the new directional step content

### Remove
- Nothing removed

## Implementation Plan

1. Expand `howItWorksSteps` data or replace with richer structured data covering all 5 cursor-movement steps
2. Add `detectionComponents` array (4 items: Camera, Eye Detection, Pupil Tracking, Gaze Estimation) with icons from lucide-react
3. Add `directionMapping` data for the gaze-direction table (pupil center/left/right/up/down → look direction → cursor direction)
4. Add `technologiesUsed` array for the tech chips
5. Add `dwellExample` step array for the Letter A scenario
6. Rebuild the "How It Works" TabsContent with subsections:
   - Detection Components (4 cards in a 2x2 grid)
   - Step-by-step working (numbered steps with the direction table inline in step 4)
   - Technologies Used (chip badges)
   - Dwell Example — Letter A walkthrough (5 steps visual flow)
7. Keep existing "Why This" and "Who Can Use" tabs unchanged
8. Add deterministic data-ocid markers to all new interactive surfaces
