'use client';

import { useState, useRef, useEffect } from 'react';

interface VideoClipperProps {
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  videoDuration: number;
}

export default function VideoClipper({
  videoId,
  videoTitle,
  videoUrl,
  videoDuration,
}: VideoClipperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(Math.min(30, videoDuration));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>('private');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const duration = endTime - startTime;
  const maxDuration = 300; // 5 minutes max

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimeChange = (value: number) => {
    const newStart = Math.max(0, Math.min(value, videoDuration - 1));
    setStartTime(newStart);
    if (endTime <= newStart) {
      setEndTime(Math.min(newStart + 10, videoDuration));
    }
    if (videoRef.current) {
      videoRef.current.currentTime = newStart;
    }
  };

  const handleEndTimeChange = (value: number) => {
    const newEnd = Math.min(videoDuration, Math.max(value, startTime + 1));
    setEndTime(newEnd);
  };

  const createClip = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your clip');
      return;
    }

    if (duration > maxDuration) {
      setError(`Clip cannot exceed ${maxDuration / 60} minutes`);
      return;
    }

    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/v1/clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceVideoId: videoId,
          title: title.trim(),
          description: description.trim() || undefined,
          startTime: Math.floor(startTime),
          endTime: Math.floor(endTime),
          visibility,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create clip');
      }

      const data = await response.json();
      alert(`Clip creation started! ID: ${data.id}`);
      setIsOpen(false);
      resetForm();
    } catch (err) {
      setError('Failed to create clip. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setStartTime(0);
    setEndTime(Math.min(30, videoDuration));
    setTitle('');
    setDescription('');
    setVisibility('private');
    setError('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Create Clip
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Create Clip</h2>
            <button
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Video preview */}
          <div className="bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full aspect-video"
              controls
            />
          </div>

          {/* Time selection */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Clip Duration</span>
              <span className={`text-sm ${duration > maxDuration ? 'text-red-600' : 'text-gray-600'}`}>
                {formatTime(duration)} / {formatTime(maxDuration)} max
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={videoDuration}
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-12">{formatTime(startTime)}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Time</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={startTime + 1}
                    max={videoDuration}
                    value={endTime}
                    onChange={(e) => handleEndTimeChange(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-12">{formatTime(endTime)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clip details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your clip a title"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full border rounded-lg px-3 py-2 resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="private">Private - Only you</option>
                <option value="unlisted">Unlisted - Anyone with link</option>
                <option value="public">Public - Visible on video</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={createClip}
              disabled={creating || duration > maxDuration}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Clip'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
