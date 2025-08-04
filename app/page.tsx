"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Play, Square, Mic, Volume2, CheckCircle } from "lucide-react"

interface BeatPattern {
  id: string
  name: string
  audioUrl: string
  pattern: string
  duration: number
  notes?: Array<{ freq: number; time: number; duration: number }>
}

export default function SoundCaptcha() {
  const [currentBeat, setCurrentBeat] = useState<BeatPattern | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasRecording, setHasRecording] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [isPlayingRecording, setIsPlayingRecording] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingRef = useRef<Blob | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const visualizerRef = useRef<HTMLDivElement>(null)

  // Initialize Web Audio API
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }

  // Generate softer, warmer tune using Web Audio API
  const generateWarmTune = async (tune: BeatPattern) => {
    const audioContext = initAudioContext()

    if (audioContext.state === "suspended") {
      await audioContext.resume()
    }

    if (!tune.notes) {
      return 2
    }

    const startTime = audioContext.currentTime + 0.1

    // Create warm, soft reverb
    const convolver = audioContext.createConvolver()
    const impulseLength = audioContext.sampleRate * 1.5
    const impulse = audioContext.createBuffer(2, impulseLength, audioContext.sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel)
      for (let i = 0; i < impulseLength; i++) {
        const decay = Math.pow(1 - i / impulseLength, 1.5)
        channelData[i] = (Math.random() * 2 - 1) * decay * 0.2 // Softer reverb
      }
    }
    convolver.buffer = impulse

    // Master effects chain for warmth
    const masterGain = audioContext.createGain()
    const compressor = audioContext.createDynamicsCompressor()
    const warmFilter = audioContext.createBiquadFilter()
    const softener = audioContext.createBiquadFilter()

    // Gentle compression
    compressor.threshold.value = -18
    compressor.knee.value = 40
    compressor.ratio.value = 8
    compressor.attack.value = 0.01
    compressor.release.value = 0.3

    // Warm low-pass filter to remove harshness
    warmFilter.type = "lowpass"
    warmFilter.frequency.value = 2200 // Lower cutoff for warmth
    warmFilter.Q.value = 0.3

    // Additional softening filter
    softener.type = "highshelf"
    softener.frequency.value = 1500
    softener.gain.value = -6 // Reduce high frequencies

    // Connect effects chain
    masterGain.connect(compressor)
    compressor.connect(warmFilter)
    warmFilter.connect(softener)
    softener.connect(audioContext.destination)
    convolver.connect(masterGain)

    masterGain.gain.value = 0.25 // Softer overall volume

    tune.notes.forEach((note, index) => {
      // Create softer, warmer sound layers
      const fundamental = audioContext.createOscillator()
      const warmth = audioContext.createOscillator()
      const softHarmonic = audioContext.createOscillator()

      // Use warmer waveforms
      fundamental.type = "triangle" // Softer than sawtooth
      warmth.type = "sine" // Pure and soft
      softHarmonic.type = "sine" // Gentle harmonic

      // Set frequencies for warm sound
      fundamental.frequency.value = note.freq
      warmth.frequency.value = note.freq * 0.5 // Sub-octave for warmth
      softHarmonic.frequency.value = note.freq * 1.5 // Gentle fifth

      // Create individual gains for soft mixing
      const fundGain = audioContext.createGain()
      const warmthGain = audioContext.createGain()
      const harmonicGain = audioContext.createGain()
      const noteGain = audioContext.createGain()

      // Soft, warm mix levels
      fundGain.gain.value = 0.7 // Main tone
      warmthGain.gain.value = 0.4 // Warmth layer
      harmonicGain.gain.value = 0.15 // Subtle harmonic

      // Connect oscillators to gains
      fundamental.connect(fundGain)
      warmth.connect(warmthGain)
      softHarmonic.connect(harmonicGain)

      // Mix to note gain
      fundGain.connect(noteGain)
      warmthGain.connect(noteGain)
      harmonicGain.connect(noteGain)

      // Soft filter for each note
      const noteFilter = audioContext.createBiquadFilter()
      noteFilter.type = "lowpass"
      noteFilter.frequency.value = note.freq * 2.5 + 400 // Gentle filtering
      noteFilter.Q.value = 0.8

      noteGain.connect(noteFilter)

      // Split between dry and wet (reverb)
      const dryGain = audioContext.createGain()
      const wetGain = audioContext.createGain()
      dryGain.gain.value = 0.6
      wetGain.gain.value = 0.4 // More reverb for softness

      noteFilter.connect(dryGain)
      noteFilter.connect(wetGain)

      dryGain.connect(masterGain)
      wetGain.connect(convolver)

      // Gentle, musical envelope
      const noteStart = startTime + note.time
      const noteEnd = noteStart + note.duration
      const attackTime = Math.min(0.15, note.duration * 0.25) // Slower attack
      const decayTime = Math.min(0.2, note.duration * 0.35)
      const sustainLevel = 0.6
      const releaseTime = Math.min(0.4, note.duration * 0.5) // Longer release

      // Very smooth envelope
      noteGain.gain.setValueAtTime(0, noteStart)
      noteGain.gain.linearRampToValueAtTime(0.6, noteStart + attackTime) // Softer peak
      noteGain.gain.exponentialRampToValueAtTime(sustainLevel, noteStart + attackTime + decayTime)
      noteGain.gain.setValueAtTime(sustainLevel, noteEnd - releaseTime)
      noteGain.gain.exponentialRampToValueAtTime(0.001, noteEnd)

      // Very gentle vibrato
      const lfo = audioContext.createOscillator()
      const lfoGain = audioContext.createGain()
      lfo.frequency.value = 3.5 + Math.random() * 0.3 // Slower vibrato
      lfoGain.gain.value = 1.5 // Gentler vibrato

      lfo.connect(lfoGain)
      lfoGain.connect(fundamental.frequency)

      // Gradual vibrato
      const vibratoGain = audioContext.createGain()
      lfoGain.connect(vibratoGain)
      vibratoGain.gain.setValueAtTime(0, noteStart)
      vibratoGain.gain.setValueAtTime(0, noteStart + attackTime + 0.2)
      vibratoGain.gain.linearRampToValueAtTime(1, noteStart + attackTime + 0.5)

      // Start all oscillators
      fundamental.start(noteStart)
      warmth.start(noteStart)
      softHarmonic.start(noteStart)
      lfo.start(noteStart)

      // Stop all oscillators
      fundamental.stop(noteEnd)
      warmth.stop(noteEnd)
      softHarmonic.stop(noteEnd)
      lfo.stop(noteEnd)
    })

    // Calculate total duration
    const totalDuration = Math.max(...tune.notes.map((note) => note.time + note.duration)) + 1.2
    return totalDuration
  }

  // Load initial tune
  useEffect(() => {
    loadNewTune()
  }, [])

  const loadNewTune = async () => {
    try {
      const response = await fetch("/api/captcha/beat")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const tune = await response.json()
      setCurrentBeat(tune)
      resetCaptcha()
      setFeedback({ message: `Loaded: ${tune.name}`, type: "info" })
    } catch (error) {
      setFeedback({ message: "Failed to load tune", type: "error" })
    }
  }

  const resetCaptcha = () => {
    setHasRecording(false)
    setIsRecording(false)
    setRecordingTime(0)
    recordingRef.current = null
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  const playBeat = async () => {
    if (!currentBeat || isPlaying) return

    setIsPlaying(true)
    setFeedback(null)

    try {
      // Try to play MP3 file first (for McDonald's)
      if (currentBeat.audioUrl.includes(".mp3")) {
        const audio = new Audio()
        audioRef.current = audio

        audio.addEventListener("ended", () => {
          setIsPlaying(false)
        })
        audio.addEventListener("error", () => {
          setIsPlaying(false)
          // Fallback to generated tune
          generateWarmTune(currentBeat)
            .then((duration) => {
              animateVisualizer()
              setTimeout(() => setIsPlaying(false), duration * 1000)
            })
            .catch(() => {
              setFeedback({ message: "Failed to play tune", type: "error" })
              setIsPlaying(false)
            })
        })

        audio.src = currentBeat.audioUrl
        audio.load()

        setTimeout(async () => {
          if (audio.readyState >= 2) {
            try {
              await audio.play()
              animateVisualizer()
            } catch (playError) {
              // Fallback to generated tune
              const duration = await generateWarmTune(currentBeat)
              animateVisualizer()
              setTimeout(() => setIsPlaying(false), duration * 1000)
            }
          } else {
            // Fallback to generated tune
            const duration = await generateWarmTune(currentBeat)
            animateVisualizer()
            setTimeout(() => setIsPlaying(false), duration * 1000)
          }
        }, 1000)
      } else {
        // For all other tunes, use Web Audio API
        const duration = await generateWarmTune(currentBeat)
        animateVisualizer()
        setTimeout(() => setIsPlaying(false), duration * 1000)
      }
    } catch (error) {
      setIsPlaying(false)
      setFeedback({ message: "Failed to initialize audio", type: "error" })
    }
  }

  const animateVisualizer = () => {
    if (!visualizerRef.current) return

    const visualizer = visualizerRef.current
    visualizer.innerHTML = ""

    // Create visualizer bars
    for (let i = 0; i < 20; i++) {
      const bar = document.createElement("div")
      bar.className = "w-1 bg-blue-500 rounded-full transition-all duration-150"
      bar.style.height = "20%"
      visualizer.appendChild(bar)
    }

    const bars = visualizer.querySelectorAll("div")
    let animationFrame = 0

    const animate = () => {
      if (!isPlaying) {
        bars.forEach((bar) => {
          ;(bar as HTMLElement).style.height = "20%"
        })
        return
      }

      bars.forEach((bar, index) => {
        const height = 20 + Math.sin((animationFrame + index) * 0.5) * 30
        ;(bar as HTMLElement).style.height = `${height}%`
        // Softer colors
        const colors = ["#60a5fa", "#a78bfa", "#fb7185", "#fbbf24", "#34d399"]
        ;(bar as HTMLElement).style.backgroundColor = colors[index % colors.length]
      })

      animationFrame += 0.2
      requestAnimationFrame(animate)
    }

    animate()
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      const supportedTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"]

      let mimeType = "audio/webm"
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type
          break
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        recordingRef.current = new Blob(chunks, { type: mimeType })
        setHasRecording(true)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      setFeedback({ message: "Microphone access denied or not available", type: "error" })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }

  const playRecording = () => {
    if (!recordingRef.current || isPlayingRecording) return

    setIsPlayingRecording(true)
    const audioUrl = URL.createObjectURL(recordingRef.current)
    const audio = new Audio(audioUrl)

    audio.onended = () => {
      setIsPlayingRecording(false)
      URL.revokeObjectURL(audioUrl)
    }

    audio.onerror = () => {
      setIsPlayingRecording(false)
      URL.revokeObjectURL(audioUrl)
      setFeedback({ message: "Failed to play recording", type: "error" })
    }

    audio.play().catch((error) => {
      setIsPlayingRecording(false)
      URL.revokeObjectURL(audioUrl)
    })
  }

  const verifyRecording = async () => {
    if (!recordingRef.current || !currentBeat) return

    setIsVerifying(true)

    try {
      const formData = new FormData()
      formData.append("recording", recordingRef.current, "recording.webm")
      formData.append("beatId", currentBeat.id)
      formData.append("actualDuration", recordingTime.toString()) // Add actual duration

      const response = await fetch("/api/captcha/verify", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setFeedback({ message: result.message, type: "success" })
      } else {
        setFeedback({ message: result.message || "Recording doesn't match. Please try again.", type: "error" })
      }
    } catch (error) {
      setFeedback({ message: "Verification failed. Please try again.", type: "error" })
    } finally {
      setIsVerifying(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-blue-200">
        <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">🎵 Musical Captcha</CardTitle>
          <CardDescription className="text-blue-100">Listen to the tune, then hum it back!</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {currentBeat && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4 font-medium">🎼 Current tune: {currentBeat.name}</p>

              {/* Play Beat Section */}
              <div className="space-y-4">
                <Button
                  onClick={playBeat}
                  disabled={isPlaying}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  {isPlaying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Playing Tune...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />🎵 Play Tune
                    </>
                  )}
                </Button>

                {/* Audio Visualizer */}
                <div
                  ref={visualizerRef}
                  className="h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-end justify-center gap-1 p-2 border border-blue-200"
                />
              </div>

              {/* Recording Section */}
              <div className="space-y-4">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isPlaying}
                  className="w-full"
                  variant={isRecording ? "destructive" : "default"}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />🎤 Hum the Tune
                    </>
                  )}
                </Button>

                {isRecording && (
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                    <span className="font-mono">{formatTime(recordingTime)}</span>
                  </div>
                )}
              </div>

              {/* Playback Section */}
              {hasRecording && (
                <Button
                  onClick={playRecording}
                  disabled={isPlayingRecording}
                  className="w-full bg-transparent border-blue-300"
                  variant="outline"
                >
                  {isPlayingRecording ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Playing...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />🔊 Play Your Recording
                    </>
                  )}
                </Button>
              )}

              {/* Verify Section */}
              {hasRecording && (
                <Button
                  onClick={verifyRecording}
                  disabled={isVerifying}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />✅ Verify Tune
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <Alert
              className={
                feedback.type === "error"
                  ? "border-red-200 bg-red-50"
                  : feedback.type === "success"
                    ? "border-green-200 bg-green-50"
                    : "border-blue-200 bg-blue-50"
              }
            >
              <AlertDescription
                className={
                  feedback.type === "error"
                    ? "text-red-800"
                    : feedback.type === "success"
                      ? "text-green-800"
                      : "text-blue-800"
                }
              >
                {feedback.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Controls */}
          <div className="text-center space-y-2">
            <button onClick={loadNewTune} className="text-blue-600 hover:text-blue-800 text-sm underline">
              Try a different tune
            </button>
            <div className="text-xs text-gray-500">🎼 Musical patterns for verification</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
