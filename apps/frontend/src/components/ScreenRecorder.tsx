'use client';

import { useState, useRef, useEffect } from 'react';

type RecordingSource = 'screen' | 'webcam' | 'screen_and_webcam' | 'window' | 'tab';

interface ScreenRecorderProps {
  onRecordingComplete?: (recordingId: string) => void;
}

export default function ScreenRecorder({ onRecordingComplete }: ScreenRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [showSetup, setShowSetup] = useState(false);
  const [title, setTitle] = useState('');
  const [source, setSource] = useState<RecordingSource>('screen');
  const [includeAudio, setIncludeAudio] = useState(true);
  const [includeWebcam, setIncludeWebcam] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    try {
      setError('');

      // Get screen capture
      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: true,
        audio: includeAudio,
      };

      const screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

      let combinedStream = screenStream;

      // Add webcam if requested
      if (includeWebcam) {
        const webcamStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        // In production, we'd combine these streams
        // For simplicity, we'll just use screen stream
      }

      streamRef.current = combinedStream;

      // Create backend recording session
      const response = await fetch('/api/v1/recordings/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          source,
          includeAudio,
          includeWebcam,
          metadata: {
            browserInfo: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
          },
        }),
      });

      const data = await response.json();
      setRecordingId(data.id);

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        await handleRecordingComplete(blob);
      };

      // Handle stream end (user clicks stop sharing)
      combinedStream.getVideoTracks()[0].onended = () => {
        if (isRecording) {
          stopRecording();
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second

      setIsRecording(true);
      setShowSetup(false);
      startTimer();
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setError(err.message || 'Failed to start recording');
    }
  };

  const pauseRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();

      await fetch(`/api/v1/recordings/${recordingId}/pause`, {
        method: 'POST',
      });
    }
  };

  const resumeRecording = async () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();

      await fetch(`/api/v1/recordings/${recordingId}/resume`, {
        method: 'POST',
      });
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    stopTimer();
    setIsRecording(false);
    setIsPaused(false);
  };

  const handleRecordingComplete = async (blob: Blob) => {
    // In production, upload blob to S3
    const rawVideoUrl = URL.createObjectURL(blob);

    await fetch(`/api/v1/recordings/${recordingId}/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawVideoUrl,
        duration,
        fileSize: blob.size,
      }),
    });

    chunksRef.current = [];
    setDuration(0);
    setTitle('');

    if (onRecordingComplete && recordingId) {
      onRecordingComplete(recordingId);
    }
  };

  // Setup modal
  if (showSetup) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h2 className="text-xl font-semibold mb-4">Start Recording</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Recording title"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as RecordingSource)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="screen">Entire Screen</option>
                <option value="window">Application Window</option>
                <option value="tab">Browser Tab</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeAudio}
                  onChange={(e) => setIncludeAudio(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Include system audio</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeWebcam}
                  onChange={(e) => setIncludeWebcam(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Include webcam overlay</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowSetup(false)}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={startRecording}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Start Recording
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Recording controls
  if (isRecording) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-4 z-50">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="font-mono text-lg">{formatDuration(duration)}</span>
        </div>

        <div className="flex gap-2">
          {isPaused ? (
            <button
              onClick={resumeRecording}
              className="p-2 bg-green-100 hover:bg-green-200 rounded-full"
              title="Resume"
            >
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={pauseRecording}
              className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-full"
              title="Pause"
            >
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          <button
            onClick={stopRecording}
            className="p-2 bg-red-100 hover:bg-red-200 rounded-full"
            title="Stop"
          >
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Default button
  return (
    <button
      onClick={() => setShowSetup(true)}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      Record Screen
    </button>
  );
}
