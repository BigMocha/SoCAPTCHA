import { NextResponse } from "next/server"

// Diverse bank of different tunes
const tuneBank = [
  {
    id: "mcdonalds-jingle",
    name: "McDonald's Jingle",
    audioUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mcdonald%27s%20commercial%20music-K0cAPgVWRqCgpzG7YBG2Pl2YZnX17O.mp3",
    pattern: "x.x.x...x.x.x...",
    duration: 3000,
    notes: [
      { freq: 523, time: 0, duration: 0.3 }, // C5 - "ba"
      { freq: 440, time: 0.4, duration: 0.2 }, // A4 - "da"
      { freq: 523, time: 0.7, duration: 0.3 }, // C5 - "ba"
      { freq: 440, time: 1.1, duration: 0.2 }, // A4 - "ba"
      { freq: 523, time: 1.4, duration: 0.5 }, // C5 - "ba"
    ],
  },
  {
    id: "happy-birthday",
    name: "Happy Birthday",
    audioUrl: "/api/audio/happy-birthday.wav",
    pattern: "x..x.x..x.x..x..",
    duration: 4000,
    notes: [
      { freq: 262, time: 0, duration: 0.5 }, // C4 - "Hap"
      { freq: 262, time: 0.5, duration: 0.3 }, // C4 - "py"
      { freq: 294, time: 0.8, duration: 0.7 }, // D4 - "Birth"
      { freq: 262, time: 1.5, duration: 0.7 }, // C4 - "day"
      { freq: 349, time: 2.2, duration: 0.7 }, // F4 - "to"
      { freq: 330, time: 2.9, duration: 1.1 }, // E4 - "you"
    ],
  },
  {
    id: "twinkle-star",
    name: "Twinkle Twinkle Little Star",
    audioUrl: "/api/audio/twinkle-star.wav",
    pattern: "x.x.x.x.x.x.x...",
    duration: 5000,
    notes: [
      { freq: 262, time: 0, duration: 0.5 }, // C4 - "Twin"
      { freq: 262, time: 0.5, duration: 0.5 }, // C4 - "kle"
      { freq: 392, time: 1.0, duration: 0.5 }, // G4 - "twin"
      { freq: 392, time: 1.5, duration: 0.5 }, // G4 - "kle"
      { freq: 440, time: 2.0, duration: 0.5 }, // A4 - "lit"
      { freq: 440, time: 2.5, duration: 0.5 }, // A4 - "tle"
      { freq: 392, time: 3.0, duration: 1.0 }, // G4 - "star"
    ],
  },
  {
    id: "mary-lamb",
    name: "Mary Had a Little Lamb",
    audioUrl: "/api/audio/mary-lamb.wav",
    pattern: "x.x.x.x.x..x.x..",
    duration: 4500,
    notes: [
      { freq: 330, time: 0, duration: 0.5 }, // E4 - "Ma"
      { freq: 294, time: 0.5, duration: 0.5 }, // D4 - "ry"
      { freq: 262, time: 1.0, duration: 0.5 }, // C4 - "had"
      { freq: 294, time: 1.5, duration: 0.5 }, // D4 - "a"
      { freq: 330, time: 2.0, duration: 0.5 }, // E4 - "lit"
      { freq: 330, time: 2.5, duration: 0.5 }, // E4 - "tle"
      { freq: 330, time: 3.0, duration: 1.0 }, // E4 - "lamb"
    ],
  },
  {
    id: "jingle-bells",
    name: "Jingle Bells",
    audioUrl: "/api/audio/jingle-bells.wav",
    pattern: "x.x.x..x.x.x..x.",
    duration: 4000,
    notes: [
      { freq: 330, time: 0, duration: 0.3 }, // E4 - "Jin"
      { freq: 330, time: 0.3, duration: 0.3 }, // E4 - "gle"
      { freq: 330, time: 0.6, duration: 0.6 }, // E4 - "bells"
      { freq: 330, time: 1.2, duration: 0.3 }, // E4 - "jin"
      { freq: 330, time: 1.5, duration: 0.3 }, // E4 - "gle"
      { freq: 330, time: 1.8, duration: 0.6 }, // E4 - "bells"
      { freq: 330, time: 2.4, duration: 0.3 }, // E4 - "jin"
      { freq: 392, time: 2.7, duration: 0.3 }, // G4 - "gle"
      { freq: 262, time: 3.0, duration: 0.5 }, // C4 - "all"
      { freq: 294, time: 3.5, duration: 0.3 }, // D4 - "the"
      { freq: 330, time: 3.8, duration: 0.7 }, // E4 - "way"
    ],
  },
  {
    id: "old-macdonald",
    name: "Old MacDonald",
    audioUrl: "/api/audio/old-macdonald.wav",
    pattern: "x.x.x.x.x.x.x.x.",
    duration: 5500,
    notes: [
      { freq: 392, time: 0, duration: 0.5 }, // G4 - "Old"
      { freq: 392, time: 0.5, duration: 0.5 }, // G4 - "Mac"
      { freq: 392, time: 1.0, duration: 0.5 }, // G4 - "Don"
      { freq: 294, time: 1.5, duration: 0.5 }, // D4 - "ald"
      { freq: 330, time: 2.0, duration: 0.5 }, // E4 - "had"
      { freq: 330, time: 2.5, duration: 0.5 }, // E4 - "a"
      { freq: 294, time: 3.0, duration: 1.0 }, // D4 - "farm"
    ],
  },
  {
    id: "london-bridge",
    name: "London Bridge",
    audioUrl: "/api/audio/london-bridge.wav",
    pattern: "x.x.x.x.x.x.x.x.",
    duration: 4800,
    notes: [
      { freq: 392, time: 0, duration: 0.4 }, // G4 - "Lon"
      { freq: 440, time: 0.4, duration: 0.4 }, // A4 - "don"
      { freq: 392, time: 0.8, duration: 0.4 }, // G4 - "Bridge"
      { freq: 349, time: 1.2, duration: 0.4 }, // F4 - "is"
      { freq: 392, time: 1.6, duration: 0.4 }, // G4 - "fall"
      { freq: 440, time: 2.0, duration: 0.4 }, // A4 - "ing"
      { freq: 392, time: 2.4, duration: 0.8 }, // G4 - "down"
    ],
  },
  {
    id: "row-boat",
    name: "Row Your Boat",
    audioUrl: "/api/audio/row-boat.wav",
    pattern: "x..x..x.x.x.x...",
    duration: 4200,
    notes: [
      { freq: 262, time: 0, duration: 0.6 }, // C4 - "Row"
      { freq: 262, time: 0.6, duration: 0.3 }, // C4 - "row"
      { freq: 262, time: 0.9, duration: 0.3 }, // C4 - "row"
      { freq: 294, time: 1.2, duration: 0.6 }, // D4 - "your"
      { freq: 330, time: 1.8, duration: 1.2 }, // E4 - "boat"
    ],
  },
]

export async function GET() {
  try {
    // Randomly select a tune from the bank
    const randomIndex = Math.floor(Math.random() * tuneBank.length)
    const selectedTune = tuneBank[randomIndex]

    return NextResponse.json(selectedTune)
  } catch (error) {
    console.error("Error fetching tune:", error)
    // Fallback to first tune if there's an error
    return NextResponse.json(tuneBank[0])
  }
}

export async function POST(request: Request) {
  try {
    const { beatId } = await request.json()

    // Find specific tune
    const tune = tuneBank.find((t) => t.id === beatId)

    if (!tune) {
      // Fallback to random tune if requested tune not found
      const randomIndex = Math.floor(Math.random() * tuneBank.length)
      return NextResponse.json(tuneBank[randomIndex])
    }

    return NextResponse.json(tune)
  } catch (error) {
    console.error("Error fetching specific tune:", error)
    // Fallback to first tune
    return NextResponse.json(tuneBank[0])
  }
}
