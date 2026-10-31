/* ==========================================================================
   rooms.js — ALL THE INFORMATION LIVES HERE. Edit freely; no code knowledge needed.
   Look for the "EDIT" markers. The behavior lives in app.js.

   Sections:  1. SITE INFO   2. THE ROOMS (one block per artwork, in display order)
   ========================================================================== */


/* ---------- 1. SITE INFO ---------- */
const SITE = {
  name:      "Marco R. Ocampo",
  className: "BSIT 3A",
  email:     "",   // EDIT: your email, e.g. "marco@school.edu". Leave "" to hide the contact link.
  intro:     "Seven pieces from my art class: scribbles, found poems, coffee, a remixed masterpiece and a short film. Each one has its own room, so pick one to step inside."
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
    tool: "",     // EDIT: the AI tool you used, e.g. "Gemini"
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
           ["1905", "Fauvism: color for color’s sake"],
           ["2026", "My version"]],
    note: "The Mona Lisa rebuilt the Fauvist way: flat, loud colors chosen for feeling, not realism."   // EDIT
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
