# PWA Icon Instructions

To complete the PWA setup, you need to create two icon files:

1. **icon-192.png** - 192x192 pixels
2. **icon-512.png** - 512x512 pixels

## Design Guidelines

Based on the WinZone logo:
- Use the orange ticket with star design
- Background should be the dark purple (#1a0b2e)
- Icon should be recognizable at small sizes
- Ensure good contrast for visibility

## Quick Creation Options

1. **Using the WinZone Logo Component:**
   - Export the SVG from `components/WinZoneLogo.jsx`
   - Convert to PNG at the required sizes
   - Use a design tool like Figma, Canva, or Photoshop

2. **Online Tools:**
   - Use PWA Asset Generator: https://github.com/onderceylan/pwa-asset-generator
   - Or use RealFaviconGenerator: https://realfavicongenerator.net/

3. **Manual Creation:**
   - Create a square canvas (192x192 or 512x512)
   - Use the WinZone ticket design
   - Save as PNG with transparency if needed

Once created, replace the placeholder files in the `public` folder.

