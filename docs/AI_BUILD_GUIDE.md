# AI Build Guide — Using AI to Fully Build Your CursedBio Profile

This guide helps you use AI assistants (ChatGPT, Claude, Cursor, etc.) to design and generate complete bio layouts for CursedBio. Share this document with your AI so it understands the schema, all element types, and how to produce valid JSON.

---

## What is CursedBio?

CursedBio is a social-bio platform with a visual, drag-and-drop editor. Profiles are stored as JSON. You can:

1. **Build in the editor** — Add elements from the sidebar, drag to position, edit properties in the right panel.
2. **Build with AI + JSON** — Paste JSON into the **Page Settings → Advanced → Page source** textarea and click **Apply** to load the layout.

The AI approach is ideal for generating full layouts quickly, or for precise control over positions and styling.

---

## How to Use This Guide with AI

**Copy this entire document** and paste it into your AI chat. Then add your own instructions, for example:

- *"Create a minimal dark bio for a musician. Name: Luna. Tagline: Dream pop artist. Include a profile photo placeholder, two links (Spotify, Bandcamp), and background music."*
- *"Make a Y2K aesthetic profile: gradient background, typewriter effect on the name, glitch effect on the tagline, and icon links for socials."*
- *"Build a link-in-bio page for a photographer: large hero image, centered name with glow effect, three buttons for portfolio, Instagram, contact."*

The AI will output valid JSON you can paste into the editor's **Page source** field and **Apply**.

---

## Root Structure

```json
{
  "version": 2,
  "canvas": { /* canvas settings */ },
  "elements": [ /* array of elements */ ]
}
```

- **`version`**: Must be `2`.
- **`canvas`**: Page dimensions, background, and global options.
- **`elements`**: Array of positioned elements. Each element has `id`, `type`, `x`, `y`, `width`, `height`, `zIndex`, and `props`.

---

## Canvas (Page) Settings

| Property | Type | Description |
|----------|------|-------------|
| `width` | number | Canvas width (px). Common: 390 (phone), 768 (tablet), 1440, 1920 |
| `height` | number | Canvas height (px). Common: 844 (phone), 1024 (tablet), 1080 |
| `backgroundType` | string | `"solid"` \| `"gradient"` \| `"image"` \| `"video"` |
| `backgroundColor` | string | Hex or rgba, e.g. `"#0a0908"` |
| `backgroundGradient` | string | CSS gradient, e.g. `"linear-gradient(180deg, #0a0908 0%, #141210 100%)"` |
| `backgroundImage` | string | URL of background image |
| `backgroundImageSize` | string | `"cover"` \| `"contain"` \| `"fill"` |
| `backgroundImagePosition` | string | e.g. `"center"`, `"50% 30%"` |
| `backgroundVideo` | string | URL of background video |
| `backgroundVideoMuted` | boolean | Default `true` (required for autoplay) |
| `backgroundBlur` | number | Blur on background layer (px), 0 = none |
| `clickToEnter` | boolean | Show "click to enter" overlay for autoplay audio |
| `enterScreenTitle` | string | e.g. `"ENTER"` |
| `enterScreenSubtitle` | string | e.g. `"Click to continue"` |
| `enterScreenBg` | string | Overlay background, e.g. `"transparent"` or `"#0a0908"` |
| `enterScreenBlur` | number | Blur of bio behind overlay (px). Default 12 when click-to-enter is on |
| `customCss` | string | Raw CSS applied to the page |
| `pageTitle` | string | Page title (metadata) |

**Example canvas:**
```json
{
  "width": 390,
  "height": 844,
  "backgroundType": "gradient",
  "backgroundGradient": "linear-gradient(180deg, #0a0908 0%, #1a1512 50%, #0a0908 100%)",
  "clickToEnter": true,
  "enterScreenTitle": "ENTER",
  "enterScreenSubtitle": "Click to continue",
  "enterScreenBlur": 12
}
```

---

## Element Base Properties

Every element has:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✓ | Unique ID, e.g. `"name"`, `"btn-spotify"` |
| `type` | string | ✓ | Element type (see below) |
| `name` | string | | Display name in layers panel |
| `x` | number | ✓ | Left position (px) |
| `y` | number | ✓ | Top position (px) |
| `width` | number | ✓ | Width (px) |
| `height` | number | ✓ | Height (px) |
| `rotation` | number | | Rotation in degrees |
| `zIndex` | number | ✓ | Stacking order (higher = on top) |
| `locked` | boolean | | Prevent editing |
| `visible` | boolean | | If false, element is hidden (dimmed in editor) |
| `pinnedTo` | string | | Container element ID — element tilts with that container in view mode |
| `props` | object | ✓ | Type-specific properties |

---

## Element Types and Props

### 1. Text (`type: "text"`)

| Prop | Type | Description |
|------|------|-------------|
| `content` | string | The text content |
| `fontSize` | number | Font size in px |
| `fontFamily` | string | Font name. Options: `system-ui`, `Arial`, `Georgia`, `Verdana`, `Inter`, `Open Sans`, `Lato`, `Montserrat`, `Poppins`, `Roboto`, `Nunito`, `Ubuntu`, `Playfair Display`, `Space Grotesk`, `DM Sans`, `Outfit`, `Josefin Sans`, `Cinzel`, `Dancing Script`, `Bebas Neue`, `Press Start 2P`, `Courier Prime`, etc. |
| `fontWeight` | string | `"100"` … `"900"` |
| `color` | string | Hex or rgba |
| `textAlign` | string | `"left"` \| `"center"` \| `"right"` \| `"justify"` |
| `lineHeight` | number | e.g. 1.5 |
| `letterSpacing` | number | e.g. 0 |
| `textShadow` | string | CSS, e.g. `"0 0 10px rgba(255,0,0,0.5)"` |
| `webkitTextStroke` | string | CSS, e.g. `"1px red"` |
| `textEffect` | string | `"none"` \| `"typewriter"` \| `"fade"` \| `"glitch"` \| `"glow"` \| `"glowParticles"` |
| `typewriterSpeed` | number | ms per character when typing |
| `typewriterDeleteSpeed` | number | ms per character when deleting |
| `typewriterPauseAtEnd` | number | Pause in ms before deleting |
| `typewriterLoop` | boolean | **Loop write → delete → repeat** (default `true`). Set `false` to run once. |
| `opacity` | number | 0–1 |

**Typewriter effect:** By default, the typewriter **loops** — it types out the text, pauses, deletes it character by character, pauses again, then repeats. Use `typewriterSpeed` for typing speed, `typewriterDeleteSpeed` for deletion speed (defaults to typing speed if omitted), `typewriterPauseAtEnd` for pause before deleting (default 1500ms).

**Example:**
```json
{
  "id": "title",
  "type": "text",
  "name": "Title",
  "x": 40,
  "y": 100,
  "width": 310,
  "height": 60,
  "zIndex": 10,
  "props": {
    "content": "Your Name",
    "fontSize": 36,
    "fontFamily": "Playfair Display",
    "color": "#E0DAC9",
    "fontWeight": "600",
    "textAlign": "center",
    "textEffect": "typewriter",
    "typewriterSpeed": 80
  }
}
```

---

### 2. Image (`type: "image"`)

| Prop | Type | Description |
|------|------|-------------|
| `src` | string | Image URL (supports GIFs) |
| `objectFit` | string | `"cover"` \| `"contain"` \| `"fill"` \| `"none"` |
| `borderRadius` | string | e.g. `"8px"`, `"50%"` |
| `border` | string | CSS border |
| `boxShadow` | string | CSS box-shadow |
| `imageClickAction` | string | `"none"` \| `"link"` \| `"copy"` |
| `href` | string | URL when `imageClickAction` is `"link"` |
| `filterBrightness` | number | 0–200, default 100 |
| `filterContrast` | number | 0–200, default 100 |
| `filterSaturate` | number | 0–200, default 100 |
| `filterBlur` | number | px, default 0 |
| `opacity` | number | 0–1 |

**Example (GIF with link):**
```json
{
  "id": "avatar",
  "type": "image",
  "x": 120,
  "y": 180,
  "width": 150,
  "height": 150,
  "zIndex": 5,
  "props": {
    "src": "https://example.com/avatar.gif",
    "objectFit": "cover",
    "borderRadius": "50%",
    "imageClickAction": "link",
    "href": "https://example.com"
  }
}
```

---

### 3. Button (`type: "button"`)

| Prop | Type | Description |
|------|------|-------------|
| `label` | string | Button text (can be empty for icon-only) |
| `href` | string | Link URL |
| `copyUrl` | boolean | If true, click copies page URL instead of linking |
| `icon` | string | URL of icon image (e.g. Simple Icons SVG) |
| `backgroundColor` | string | Hex or rgba |
| `color` | string | Text/icon color |
| `borderRadius` | string | e.g. `"8px"`, `"50%"` |
| `fontSize` | number | Font size |
| `boxShadow` | string | CSS box-shadow |
| `opacity` | number | 0–1 |

**Example (icon link):**
```json
{
  "id": "gh",
  "type": "button",
  "x": 173,
  "y": 400,
  "width": 44,
  "height": 44,
  "zIndex": 15,
  "props": {
    "label": "",
    "icon": "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg",
    "href": "https://github.com",
    "backgroundColor": "transparent",
    "borderRadius": "50%"
  }
}
```

---

### 4. Shape (`type: "shape"`)

| Prop | Type | Description |
|------|------|-------------|
| `backgroundColor` | string | Hex or rgba |
| `background` | string | Full CSS background |
| `borderRadius` | string | e.g. `"0"`, `"8px"`, `"50%"` |
| `border` | string | CSS border |
| `boxShadow` | string | CSS box-shadow |
| `opacity` | number | 0–1 |

**Example (divider line):**
```json
{
  "id": "divider",
  "type": "shape",
  "x": 95,
  "y": 200,
  "width": 200,
  "height": 2,
  "zIndex": 5,
  "props": {
    "backgroundColor": "#B66E41"
  }
}
```

---

### 5. Container (`type: "div"`)

Glass/frosted panel. Use as a background layer (low zIndex) so content sits on top. Elements can be **pinned** to it so they tilt together in view mode.

| Prop | Type | Description |
|------|------|-------------|
| `backgroundColor` | string | e.g. `"rgba(255,255,255,0.08)"` |
| `backdropFilter` | string | e.g. `"blur(12px)"`, `"blur(16px) brightness(0.8)"` |
| `border` | string | e.g. `"1px solid rgba(255,255,255,0.12)"` |
| `borderRadius` | string | e.g. `"16px"` |
| `boxShadow` | string | CSS box-shadow |
| `mouseTilt` | boolean | 3D tilt effect when hovering (view mode only) |
| `tiltIntensity` | number | Tilt degrees, default 12 |
| `backgroundImage` | string | Optional background image URL |
| `backgroundSize` | string | `"cover"` \| `"contain"` |
| `backgroundPosition` | string | e.g. `"center"` |
| `opacity` | number | 0–1 |

**Example:**
```json
{
  "id": "card",
  "type": "div",
  "name": "Card",
  "x": 30,
  "y": 120,
  "width": 330,
  "height": 500,
  "zIndex": 1,
  "props": {
    "backgroundColor": "rgba(255,255,255,0.08)",
    "backdropFilter": "blur(12px)",
    "border": "1px solid rgba(255,255,255,0.12)",
    "borderRadius": "16px",
    "mouseTilt": true
  }
}
```

To pin another element to this container, set `pinnedTo: "card"` on that element (use the container's `id`).

---

### 6. Video (`type: "video"`)

| Prop | Type | Description |
|------|------|-------------|
| `src` | string | Video URL |
| `poster` | string | Poster image URL |
| `controls` | boolean | Show video controls |
| `borderRadius` | string | e.g. `"8px"` |
| `opacity` | number | 0–1 |

---

### 7. Audio (`type: "audio"`)

| Prop | Type | Description |
|------|------|-------------|
| `src` | string | Audio URL |
| `autoplay` | boolean | Autoplay on enter (requires Click to enter) |
| `controls` | boolean | Show controls |
| `color` | string | Icon color |
| `opacity` | number | 0–1 |

---

### 8. Embed (`type: "embed"`)

| Prop | Type | Description |
|------|------|-------------|
| `url` | string | Embed URL, e.g. `"https://www.youtube.com/embed/VIDEO_ID"` |
| `borderRadius` | string | e.g. `"8px"` |
| `opacity` | number | 0–1 |

---

### 9. Profile Views (`type: "profileViews"`)

| Prop | Type | Description |
|------|------|-------------|
| `count` | number | View count to display |
| `icon` | string | `"eye"` \| `"none"` |
| `fontSize` | number | Font size |
| `color` | string | Text/icon color |
| `opacity` | number | 0–1 |

**Example:**
```json
{
  "id": "views",
  "type": "profileViews",
  "x": 40,
  "y": 50,
  "width": 80,
  "height": 24,
  "zIndex": 10,
  "props": {
    "count": 1234,
    "icon": "eye",
    "fontSize": 14,
    "color": "#9a958c"
  }
}
```

---

## Generating Unique IDs

Each element must have a unique `id`. Use descriptive slugs: `name`, `tagline`, `avatar`, `btn-spotify`, `btn-instagram`, `card`, `divider`, `views`, etc. The AI should generate IDs like `text-1`, `btn-gh`, `img-hero` if no specific naming is requested.

---

## Layout Tips

1. **Canvas size** — Use `390 x 844` for mobile-first link-in-bio; `1920 x 1080` for desktop.
2. **zIndex** — Background/shapes: 1–5. Content: 8–15. Overlays: 20+.
3. **Containers** — Put `div` containers at low zIndex (e.g. 1) so text and buttons render on top.
4. **Center horizontally** — For width 390: center = `x: (390 - elementWidth) / 2`.
5. **Spacing** — Leave ~20–40px padding from edges; 16–24px between stacked elements.

---

## Example: Complete Minimal Bio

```json
{
  "version": 2,
  "canvas": {
    "width": 390,
    "height": 844,
    "backgroundType": "gradient",
    "backgroundGradient": "linear-gradient(180deg, #0a0908 0%, #1a1512 50%, #0a0908 100%)"
  },
  "elements": [
    {
      "id": "name",
      "type": "text",
      "name": "Name",
      "x": 40,
      "y": 120,
      "width": 310,
      "height": 48,
      "zIndex": 10,
      "props": {
        "content": "Your Name",
        "fontSize": 32,
        "fontFamily": "Georgia",
        "color": "#E0DAC9",
        "fontWeight": "normal",
        "textAlign": "center"
      }
    },
    {
      "id": "line",
      "type": "shape",
      "name": "Divider",
      "x": 120,
      "y": 190,
      "width": 150,
      "height": 2,
      "zIndex": 5,
      "props": { "backgroundColor": "#B66E41" }
    },
    {
      "id": "tagline",
      "type": "text",
      "name": "Tagline",
      "x": 40,
      "y": 220,
      "width": 310,
      "height": 32,
      "zIndex": 8,
      "props": {
        "content": "Short tagline here",
        "fontSize": 14,
        "fontFamily": "Inter",
        "color": "#9a958c",
        "textAlign": "center"
      }
    },
    {
      "id": "btn",
      "type": "button",
      "name": "Link",
      "x": 95,
      "y": 300,
      "width": 200,
      "height": 44,
      "zIndex": 12,
      "props": {
        "label": "Link",
        "href": "#",
        "backgroundColor": "#B66E41",
        "color": "#E0DAC9",
        "borderRadius": "8px",
        "fontSize": 15
      }
    }
  ]
}
```

---

## Custom CSS

You can inject custom CSS to style your bio page beyond the built-in properties. The CSS is applied to the entire bio view and lets you override defaults, add animations, or match a specific aesthetic.

### Where to Add Custom CSS

**In the editor:** Page Settings (gear icon) → **Advanced — Page CSS** → paste your CSS.

**In JSON:** Add `customCss` to the canvas object. The value is a string; use `\n` for newlines in JSON.

```json
{
  "canvas": {
    "width": 390,
    "height": 844,
    "customCss": "body { cursor: crosshair; }\n[data-element-id=\"name\"] { filter: drop-shadow(0 0 8px gold); }"
  }
}
```

### How It Works

- Custom CSS is injected as a `<style>` tag on the bio page.
- It applies globally to the page, including the canvas and all elements.
- Use standard CSS: selectors, rules, media queries, keyframes, etc.

### Targeting Elements

Each element has `data-element-id` and `data-element-type` attributes. Use these to target specific elements:

| Selector | Targets |
|----------|---------|
| `[data-element-id="name"]` | Element with `id: "name"` |
| `[data-element-type="text"]` | All text elements |
| `[data-element-type="button"]` | All buttons |
| `[data-element-id="btn-spotify"][data-element-type="button"]` | A specific button |

**Example — glow on the name:**
```css
[data-element-id="name"] {
  filter: drop-shadow(0 0 12px rgba(255, 200, 100, 0.6));
}
```

**Example — hover effect on all buttons:**
```css
[data-element-type="button"]:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
```

### Common Use Cases

**Custom scrollbar:**
```css
.bio-canvas::-webkit-scrollbar {
  width: 8px;
}
.bio-canvas::-webkit-scrollbar-thumb {
  background: rgba(182, 110, 65, 0.5);
  border-radius: 4px;
}
```

**Page-wide cursor:**
```css
body {
  cursor: url('/cursor.cur'), default;
}
```

**Override link styles:**
```css
[data-element-type="button"] a,
[data-element-type="image"] a {
  text-decoration: none;
}
```

**Extra animation on an element:**
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
[data-element-id="avatar"] {
  animation: float 3s ease-in-out infinite;
}
```

**Responsive adjustments:**
```css
@media (max-width: 480px) {
  [data-element-id="title"] { font-size: 24px !important; }
}
```

### Tips

- Use `!important` sparingly if you need to override inline styles.
- Element dimensions/positions are set inline; override with `transform` or `filter` when possible.
- Test on both editor preview and published page — custom CSS applies to both.

---

## Example Prompts for AI

Use these as templates. Replace placeholders with your details.

**Minimal dark bio**
> Create a CursedBio layout JSON. Canvas 390x844, dark gradient background. Elements: centered name "[Name]" (Playfair Display, 32px), thin divider, tagline "[tagline]" (Inter, 14px, muted), one button "[Label]" linking to [URL].

**Y2K / vaporwave**
> Create a CursedBio layout. Canvas 390x844. Gradient background (purple/pink/cyan). Name with typewriter effect (looping: write then delete). Tagline with glitch effect. Three icon buttons (use Simple Icons CDN: github, twitter, discord). Container with glass blur and 3D mouse tilt. Center everything.

**Musician with audio**
> CursedBio layout for a musician. 390x844. Dark background. Name "Luna", tagline "Dream pop artist". Circular avatar placeholder (use placeholder image URL). Two buttons: Spotify, Bandcamp. Audio element with autoplay. Enable click-to-enter so the audio can play. Use a container with blur for the main card.

**Link-in-bio grid**
> CursedBio layout. 390x844. Hero image at top. Name below. Six buttons in a 2x3 grid for links. Each button: label and href. Use a frosted glass container behind the buttons. Profile views element in the corner.

**With custom CSS**
> Create a CursedBio layout with `customCss` in the canvas. Include CSS that adds a drop-shadow to the element with id "name" and a hover scale effect on all buttons. Use `[data-element-id="name"]` and `[data-element-type="button"]` selectors.

---

## Applying AI-Generated JSON

1. Open CursedBio editor.
2. Click the **Page** (gear) icon to open Page Settings.
3. Scroll to **Advanced — Page source**.
4. Paste the JSON (replace existing or merge carefully).
5. Click **Apply**.
6. The layout loads into the editor. You can tweak positions visually or edit the JSON again.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Need version, canvas, and elements" | Ensure `version: 2`, `canvas` object, and `elements` array exist. |
| Elements overlap | Adjust `zIndex`. Lower numbers are behind. |
| Element not visible | Check `visible` is not `false`. Check `x`, `y` are within canvas. |
| Font not loading | Use exact font names from the list. System fonts (Arial, Georgia) always work. |
| Audio doesn't play | Enable `clickToEnter` in canvas and `autoplay` on the audio element. |
| Typewriter doesn't loop | Ensure `typewriterLoop` is not `false`; set `typewriterPauseAtEnd` > 0. |
| Pinned elements don't tilt | Ensure the container has `mouseTilt: true` and elements have `pinnedTo` set to the container's `id`. |

---

## Reference: Simple Icons for Icon Links

Use `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/[name].svg` for button icons.

Examples: `github`, `twitter`, `instagram`, `youtube`, `spotify`, `discord`, `twitch`, `linkedin`, `tiktok`, `reddit`, `medium`, `patreon`, `ko-fi`.

---

*Last updated for CursedBio schema v2. Share this guide with your AI to generate valid layouts.*
