✅ DOCUMENT: Video Player Upgrade Requirements (React Native)
Goal: Convert current video player into a modern Vidstack-style, OTT-level video player with upgraded UX, animations, gestures, and auto-rotation.
1️⃣ UI/UX IMPROVEMENTS REQUIRED (VIDSTACK STYLE)
➤ Adopt Vidstack UI style

Use the visual design, layout, spacing, and simplicity inspired by Vidstack (https://vidstack.io
 / https://github.com/vidstack/player
):

Minimal, clean, modern UI

Floating top bar and bottom bar

Smooth fade animations

Rounded icons & modern button style

Bottom-right settings button

Simple, clean timeline

Proper spacing and padding

Better contrast and readability

➤ Update all icons

Replace current text icons (▶ ❚❚ CC, HD) with modern SVG-style icons:

Play / Pause

10s Skip Forward / Backward

Settings icon

Captions icon

Audio icon

Speed icon

Quality (HD) icon

Fit/Fill icon

Fullscreen icon

Make size & padding consistent across devices.

2️⃣ CONTROL BEHAVIOR IMPROVEMENTS
➤ Tap behavior (IMPORTANT FIX)

Tapping the video should toggle UI controls:

If controls are visible → hide

If controls are hidden → show

(Current player always shows controls; fix this.)

➤ Auto-hide controls

Hide UI after 3 seconds of inactivity only when not paused.

➤ Pause state

When the video is paused, controls must remain visible (like Netflix).

3️⃣ GESTURES & INTERACTIONS
➤ Double Tap Skips (YouTube/Netflix style)

Double tap right → +10 seconds

Double tap left → -10 seconds

Show a floating animation (“+10s” / “–10s”)

➤ Vertical Swipe Gestures (Optional but recommended)

Left side vertical swipe → control brightness

Right side vertical swipe → control volume

➤ Long press (optional)

Long press → temporary 2x speed (like YT mobile)

4️⃣ FULLSCREEN & ORIENTATION IMPROVEMENTS
➤ Auto-rotate to landscape when video starts

Use react-native-orientation-locker:

Lock to landscape on onLoad

Unlock back to portrait on close

➤ Add fullscreen toggle button

User can manually:

Enter fullscreen (landscape)

Exit fullscreen (portrait)

Also support auto-rotate when device rotates.

5️⃣ SETTING PANEL (VIDSTACK STYLE)

Create a bottom slide-up settings modal similar to Vidstack containing 4 tabs:

1. Audio Tracks

Show available audio tracks

Highlight selected

On select → apply immediately

2. Subtitles (Captions)

Show all subtitle tracks

“None” option

Highlight selected

3. Playback Speed

Values: 0.5x, 1x, 1.25x, 1.5x, 2x

Highlight active

4. Video Quality

Auto

Then show available resolutions (e.g., 144p → 1080p)

Highlight active

➤ Settings modal animation

Slide up from bottom

250ms ease animation

Dark translucent background

Touch outside → close

6️⃣ PROGRESS BAR IMPROVEMENTS
➤ Add buffered progress

Use playableDuration to show a grey/white buffer bar behind the main slider.

➤ Better slider UI

Larger thumb

Smoother tracking

No glow

Vidstack-like thin progress line

➤ Show preview time while dragging

(Optional but good UX)

Small tooltip above thumb showing time while sliding.

7️⃣ GENERAL ANIMATION IMPROVEMENTS
➤ Fade in/out all controls

200–250ms

Smooth ease curve

synced opacity for top bar, bottom bar, center buttons

➤ Slide animations

Settings drawer slides up

Controls slide slightly when appearing (Vidstack behavior)

8️⃣ ERROR / LOADING IMPROVEMENTS
➤ Show loading spinner overlay

Centered loader like Netflix:

Spinner

“Loading…” text

Dimmed background

➤ Retry button on error

Clean error message

“Retry” and “Go Back” options

9️⃣ CODE IMPROVEMENTS REQUIRED
➤ Refactor player into modules

Split into separate components:

VideoCore.js (handles react-native-video, play/pause, seeking)

ControlsOverlay.js (UI buttons, progress bar, icons)

GestureHandler.js (double tap, swipe gestures)

SettingsModal.js (audio, captions, speed, quality)

FullscreenHandler.js (orientation + status bar)

This improves maintainability.

➤ Improve state handling

Organize states:

showControls

paused

playbackRate

selectedAudioTrack

selectedTextTrack

selectedVideoTrack

resizeMode

showSettings

1️⃣0️⃣ ADDITIONAL OPTIONAL FEATURES
✔ Picture-in-Picture mode (Android)
✔ Resume from last watched position
✔ Thumbnail preview on seek
✔ Adaptive UI for tablets