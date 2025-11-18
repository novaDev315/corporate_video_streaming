'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import CastPlayer from '@/components/CastPlayer';
import OfflineDownload from '@/components/OfflineDownload';
import { videosApi } from '@/lib/api';
import { Play, Download, Share2, Edit } from 'lucide-react';

export default function VideoPage() {
  const params = useParams();
  const videoId = params.id as string;
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  const loadVideo = async () => {
    try {
      const response = await videosApi.getById(videoId);
      setVideo(response.data);
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = (currentTime: number) => {
    // Track watch progress
    videosApi.trackView(videoId, {
      watchTime: Math.floor(currentTime),
      completionPercentage: Math.floor(
        (currentTime / (video?.duration || 1)) * 100,
      ),
      deviceType: 'desktop',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Video not found</h2>
          <p className="text-gray-600">The video you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden mb-6">
          <VideoPlayer
            src={video.hlsUrl || 'https://example.com/demo.m3u8'}
            poster={video.thumbnailUrl}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>

        {/* Video Info and Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
              <p className="text-gray-600 mb-4">{video.description}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>{video.viewCount || 0} views</span>
                <span>•</span>
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Cast Controls */}
            <CastPlayer
              videoUrl={video.hlsUrl || ''}
              title={video.title}
              thumbnailUrl={video.thumbnailUrl}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => setShowDownload(!showDownload)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="w-5 h-5" />
              Download Offline
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
              <Share2 className="w-5 h-5" />
              Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
              <Edit className="w-5 h-5" />
              Edit Video
            </button>
          </div>
        </div>

        {/* Download Section */}
        {showDownload && (
          <div className="mb-6">
            <OfflineDownload videoId={videoId} videoTitle={video.title} />
          </div>
        )}

        {/* Video Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Video Details</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Duration:</dt>
                <dd className="font-medium">
                  {Math.floor(video.duration / 60)}:
                  {String(video.duration % 60).padStart(2, '0')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Category:</dt>
                <dd className="font-medium">{video.category || 'Uncategorized'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Status:</dt>
                <dd className="font-medium capitalize">{video.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Created by:</dt>
                <dd className="font-medium">
                  {video.createdBy?.firstName} {video.createdBy?.lastName}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Engagement</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">72%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: '72%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Average Watch Time</span>
                  <span className="font-medium">8:45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
