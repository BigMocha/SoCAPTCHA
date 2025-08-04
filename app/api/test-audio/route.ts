import { NextResponse } from "next/server"

// Create a very simple, guaranteed-to-work WAV file
function createSimpleWav(): ArrayBuffer {
  const sampleRate = 44100
  const duration = 2 // 2 seconds
  const numSamples = sampleRate * duration
  const numChannels = 1
  const bitsPerSample = 16
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const dataSize = numSamples * blockAlign

  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  // RIFF header
  view.setUint32(0, 0x52494646, false) // "RIFF"
  view.setUint32(4, 36 + dataSize, true) // File size
  view.setUint32(8, 0x57415645, false) // "WAVE"

  // fmt chunk
  view.setUint32(12, 0x666d7420, false) // "fmt "
  view.setUint32(16, 16, true) // Chunk size
  view.setUint16(20, 1, true) // Audio format (PCM)
  view.setUint16(22, numChannels, true) // Number of channels
  view.setUint32(24, sampleRate, true) // Sample rate
  view.setUint32(28, byteRate, true) // Byte rate
  view.setUint16(32, blockAlign, true) // Block align
  view.setUint16(34, bitsPerSample, true) // Bits per sample

  // data chunk
  view.setUint32(36, 0x64617461, false) // "data"
  view.setUint32(40, dataSize, true) // Data size

  // Generate simple sine wave
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.3
    const intSample = Math.round(sample * 32767)
    view.setInt16(44 + i * 2, intSample, true)
  }

  return buffer
}

export async function GET() {
  try {
    const audioBuffer = createSimpleWav()

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Test audio error:", error)
    return NextResponse.json({ error: "Failed to generate test audio" }, { status: 500 })
  }
}
