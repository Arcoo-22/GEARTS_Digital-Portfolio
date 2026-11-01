/* ==========================================================================
   rooms.js — ALL THE INFORMATION LIVES HERE. Edit freely; no code knowledge needed.
   Look for the "EDIT" markers. The behavior lives in app.js.

   Sections:  1. SITE INFO   2. THE ROOMS (one block per artwork, in display order)
   ========================================================================== */


/* ---------- 1. SITE INFO ---------- */
const SITE = {
  name:      "Marco R. Ocampo",
  className: "BSIT 3A",
  intro:     "Work from my art class, with a room for every piece. Scroll to step inside."
};


/* ---------- 2. THE ROOMS ----------
   Fields every room has:
     id        short web-safe name (used in the link: #scribble)
     type      which layout to use (scribble, spines, blackout, coffee, ai, time, finals)
     title     shown on the tile and in the room
     medium    materials, shown under the title
     year      year made
     color     room + tile background       shadow  offset shadow color      ink  text color
     tile      small picture for the home grid
     alt       description of the artwork for screen readers
     note      your words about the piece (2–4 sentences works best). These are DRAFTS: rewrite them.
*/
const ROOMS = [

  /* --- Scribble drawing --- */
  {
    id: "scribble", type: "scribble", title: "The Fear of Being Seen", medium: "Pen and marker", year: 2026,
    color: "#FF7A3D", shadow: "#14120C", ink: "#14120C",
    tile: "img/t-scribble.webp", img: "img/scribble.webp",
    alt: "Scribble drawing of a large eye crossed out with two black lines, surrounded by swirls and orange circles with x marks",
    note: "An eye crossed out and buried under scribbles: wanting to be noticed and hiding at the same time. Rub the black away to find it."   // EDIT
  },

  /* --- Book-spine poetry: each shelf has lines; y and h are % of the photo (position and height of each spine) --- */
  {
    id: "spines", type: "spines", title: "Book-spine poetry", medium: "Found library books", year: 2026,
    color: "#3D6BFF", shadow: "#FFD21F", ink: "#FFFFFF",
    tile: "img/t-spines.webp",
    alt: "Stack of library books whose spines read as lines of a poem",
    shelves: [
      { img: "img/spine1.webp", w: 900, h: 1200,
        alt: "Six stacked library books: So I shall tell you a story, Someday, Somewhere Out There, The Perfect Lover, Bury This, The Greatest Book Ever Written",
        lines: [
          { t: "so I shall tell you a story…",   y: 11.5, h: 11.5 },
          { t: "someday",                        y: 23.3, h: 13.6 },
          { t: "somewhere out there",            y: 37.6, h: 10.2 },
          { t: "the perfect lover",              y: 48,   h: 9 },
          { t: "bury this",                      y: 57.4, h: 8.2 },
          { t: "the greatest book ever written", y: 65.8, h: 10.7 } ] },
      { img: "img/spine2.webp", w: 1200, h: 900,
        alt: "Five stacked library books: The Woman He Loved, In the Garden of Our Dreams, Happy Are They, Caring and Curing, Diana Her New Life",
        lines: [
          { t: "the woman he loved",           y: 10.7, h: 22.5 },
          { t: "in the garden of our dreams",  y: 32.8, h: 11.8 },
          { t: "happy are they",               y: 44,   h: 7.2 },
          { t: "caring and curing",            y: 52,   h: 16 },
          { t: "her new life",                 y: 69,   h: 11 } ] }
    ],
    note: "Tap a spine, or a line of the poem, to read them together. The titles on the shelf are the only words I used."   // EDIT
  },

  /* --- Blackout poetry. rows = [bar width %, kept word, word-end bar %]; poem = the finished text --- */
  {
    id: "blackout", type: "blackout", title: "Blackout poetry", medium: "Marker on printed page", year: 2026,
    color: "#C8F169", shadow: "#14120C", ink: "#14120C",
    tile: "img/t-blackout.webp", img: "img/blackout.webp",
    alt: "Blackout poem with a black marker block, a few visible words, and doodles of a paper plane, clouds, leaves, and a book",
    poem: "No need for a win. Shaping, inspiring, opening, connecting.",
    rows: [[30, "no need for", 20], [70], [55], [40, "win", 30], [75], [62], [48, "shaping", 18], [70], [58],
           [35, "inspiring", 25], [72], [66], [28, "opening", 34], [60], [44, "connecting", 20], [68], [52]],
    note: "I blacked out a printed page and kept only the words that said something on their own. The doodles around it carry the same hopeful mood."   // EDIT
  },

  /* --- Coffee painting --- */
  {
    id: "coffee", type: "coffee", title: "Coffee painting", medium: "Coffee on paper", year: 2026,
    color: "#E3B77A", shadow: "#6B3E1B", ink: "#14120C",
    tile: "img/t-coffee.webp", img: "img/coffee.webp", w: 1400, h: 1050,
    alt: "Landscape painted in brown coffee tones with two large hills, a winding river, and clusters of trees",
    note: "Painted with coffee alone: pale washes for the hills, dark lines for the river and trees."
  },

  /* --- AI appropriation. tool and prompt are optional: fill them in and they appear under the picture --- */
  {
    id: "ai", type: "ai", title: "AI art appropriation", medium: "AI-edited painting", year: 2026,
    color: "#8B5CF6", shadow: "#FFD21F", ink: "#FFFFFF",
    tile: "img/t-ai.webp", before: "img/ai-before.webp", after: "img/ai-after.webp",
    alt: "Two versions of a painting of three men playing cards, with the figure on the left changed",
    cap: "Original: The Cardsharps, Caravaggio, about 1594.",
    tool: "Chatgpt",     // EDIT: the AI tool you used, e.g. "Gemini"
    prompt: "",   // EDIT: the instruction you gave it
    note: "I started from Caravaggio's The Cardsharps and used AI to rework the figure on the left. Drag the slider to compare the original with my version."   // EDIT: say what you changed and why
  },

  /* --- Art through time. eras = [date, label] --- */
  {
    id: "time", type: "time", title: "Art through time", medium: "Paint on paper", year: 2026,
    color: "#FFD21F", shadow: "#E8588A", ink: "#14120C",
    tile: "img/t-time.webp", img: "img/time.webp", w: 900, h: 1352,
    alt: "Painting of a woman with folded hands in bold flat colors: orange face, purple and teal clothes, pink and blue background",
    eras: [["c. 1503", "Mona Lisa, Leonardo da Vinci: a Renaissance portrait"],
           ["1860s–1970s", "Modern Art: color and expression over realism"],
           ["2026", "My version"]],
    note: "Art Movement: Modern Art\nMy painting is inspired by Modern Art, which focuses on creativity, expression, and the use of colors in different ways. I used bright colors such as yellow, orange, pink, blue, purple, and green instead of realistic colors. I also blended yellow and orange to create a smooth transition from darker to lighter shades. For the blue areas, I added a little black to make the color darker and create more depth. I also used simple shapes, bold outlines, and visible brushstrokes to make the painting more expressive. These techniques give the painting a modern and creative look rather than making it completely realistic."
  },

  /* --- Finals video. describe = text description for people who can't watch/hear it.
         captions = optional path to a .vtt subtitle file, e.g. "video/finals.vtt" --- */
  {
    id: "finals", type: "finals", title: "Finals multimedia art", medium: "Video with sound", year: 2026,
    color: "#14120C", shadow: "#E8588A", ink: "#FFFFFF",
    tile: "img/t-finals.webp", poster: "img/poster.webp", video: "video/finals.mp4",
    alt: "Still from a video showing a small statue of a figure in white with two children",
    captions: "",
    describe: "A small statue of a figure in white stands with two children. The video runs 30 seconds and has sound.",   // EDIT: add what happens and what you hear
    note: "A 30-second video. Turn the sound on."
  }
];


/* ==========================================================================
   NEW SECTIONS. Edit the words, links and file names below.
   ========================================================================== */

/* ---------- WRITTEN ANALYSIS: pages are img/analysis/page-01.webp ... (already made from your PDF) ---------- */
const ANALYSIS = {
  title: "Balota (2024): artwork analysis",
  blurb: "A written analysis of a five-minute sequence from Dakip “Kip” Oebanda’s film, using the art criticism process: observation, analysis, contextualization, interpretation and judgment. Drag or swipe through the pages.",
  pages: 15,
  pdf: "Balota_Written_Analysis.pdf"
};

/* ---------- VIDEO ANALYSIS: paste your YouTube link between the quotes ---------- */
const VIDEO = {
  url: "https://youtu.be/l3SPF_kXB8c?si=rSGPhKe5ITKoCO6k",  
  title: "Balota, spoken",
  blurb: "The same analysis, recorded. Press play, or jump straight to a chapter.",
  // EDIT: t = start time in seconds for each chapter
  chapters: [

  ]
};

/* ---------- SONG ---------- */
const SONG = {
  title: "ONE IN A MILLION",
  artist: "Marco R. Ocampo",      // EDIT: artist name(s)
  year: 2026,                      // EDIT
  file: "audio/one-in-a-million.mp3",
  cover: "img/photography.webp",
  note: "Press play and let it run while you scroll."   // EDIT
};

/* ---------- PHOTOGRAPHY ---------- */
const PHOTO = {
  title: "Photography",
  img: "img/photography.webp", w: 1300, h: 2311,
  alt: "A person in a white top and black trousers stands on grass under tall trees with sunlight breaking through the branches",
  caption: "Light through the branches.",   // EDIT
  note: "A quiet moment under old trees in Anilao-Labac, Lipa City, with the sun breaking through the canopy.",   // EDIT: add what you wanted to capture
  details: [["Place", "Anilao-Labac, Lipa City, Batangas"], ["Format", "JPEG, 2160 × 3840 px"]]
};

/* ---------- MANGA ---------- */
const MANGA = {
  title: "Gojo",
  sub: "Ink study",
  medium: "Manga art", year: 2024,   // the drawing is signed 10/27/2024
  img: "img/manga-gojo.webp", w: 1300, h: 1733,
  alt: "Black ink drawing of a spiky-haired anime character in profile, head bowed, with heavy black shading across the shoulder",
  kanji: "呪術廻戦",   // EDIT: the vertical text in the black panel. Change or clear it ("") if the character is from another series
  bubble: "Manga art",   // EDIT: your words about the drawing
  note: ""   // EDIT
};

/* ---------- APPENDICES: three folders. ----------
   steps = a row of pictures (process). img = one picture. details = label/value pairs. link = button.
   wide = how wide the folder is when open. */
const APPENDICES = [
  { kind: "Process", title: "Manga: sketch process", text: "From the reference photo to the inked drawing.", wide: "min(99vw,1120px)",
    steps: [ { img: "img/appendix/ref.jpg", label: "Reference photo" },
             { img: "img/appendix/first.jpg",   label: "Sketch 1" },
             { img: "img/appendix/second.jpg",   label: "Sketch 2" },
             { img: "img/appendix/third.jpg",      label: "Inked lines" } ] },
  { kind: "Listen", title: "One in a Million on BandLab", text: "The track is also posted on BandLab.",
    link: "https://www.bandlab.com/post/3d2c0dc5-2d2a-47e7-972d-0df6785c800b", linkLabel: "Open on BandLab" },
  { kind: "Details", title: "Photography: image details", text: "Where the photograph was taken and the file it came from.", img: "img/photography.webp",
    details: [["Location", "Anilao-Labac, Lipa City, Batangas"], ["File", "JPEG"], ["Size", "2160 × 3840 px"], ["Orientation", "Portrait"]] }
];