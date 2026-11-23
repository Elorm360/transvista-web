# Drop original photos here

1. Put each photo in the right folder, **named after the page it belongs to**:

   | Page | Save as |
   |---|---|
   | Accra destination | `destinations/accra.jpg` |
   | Cape Coast destination | `destinations/cape-coast.jpg` |
   | Kumasi destination | `destinations/kumasi.jpg` |
   | Volta Region destination | `destinations/volta-region.jpg` |
   | Mole National Park destination | `destinations/mole-national-park.jpg` |
   | Kakum National Park destination | `destinations/kakum-national-park.jpg` |
   | Accra City & Culture experience | `experiences/accra-city-culture.jpg` |
   | Cape Coast Heritage experience | `experiences/cape-coast-heritage.jpg` |
   | Ashanti Culture & Craft experience | `experiences/kumasi-ashanti-culture.jpg` |
   | Volta Nature & Adventure experience | `experiences/volta-nature-adventure.jpg` |
   | Mole Wildlife Safari experience | `experiences/mole-wildlife-safari.jpg` |
   | Kakum Canopy Walk experience | `experiences/kakum-canopy-walk.jpg` |

   Accra, Kumasi and Kakum (and their experiences) have no photo at all yet.
   The others currently use illustrative photos.

2. Optional: add a one-line description of the photo in a `.txt` file with
   the same name (e.g. `destinations/accra.txt`). It becomes the alt text
   for screen readers and Google.

3. Run:

   ```
   npm run photos
   ```

   It resizes each photo to 1600 px wide, compresses it, removes location
   and camera data, and puts it on the site. No code changes needed.

Use **landscape** photos, ideally straight from the camera (big is fine).
JPG, PNG and WebP work. iPhone HEIC does not: set Settings → Camera →
Formats → Most Compatible, or export as JPG.

Originals in this folder are never committed to git. Only the optimized
copies in `public/images/` are.
