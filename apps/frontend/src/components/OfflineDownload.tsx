'use client';

import { useState } from 'react';
import { Download, Check, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface OfflineDownloadProps {
  videoId: string;
  videoTitle: string;
}

export default function OfflineDownload({
  videoId,
  videoTitle,
}: OfflineDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState('480p');

  const qualities = [
    { value: '360p', label: '360p (Low)', size: '~50MB' },
    { value: '480p', label: '480p (Medium)', size: '~100MB' },
    { value: '720p', label: '720p (High)', size: '~200MB' },
    { value: '1080p', label: '1080p (HD)', size: '~400MB' },
  ];

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      // Step 1: Prepare download
      const prepareResponse = await api.post('/downloads/prepare', {
        videoId,
        quality: selectedQuality,
        deviceId: getDeviceId(),
        deviceType: getDeviceType(),
      });

      const downloadId = prepareResponse.data.download.id;

      // Step 2: Poll for download readiness
      let downloadReady = false;
      while (!downloadReady) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const statusResponse = await api.get(`/downloads/${downloadId}`);
        const status = statusResponse.data.status;

        if (status === 'completed') {
          downloadReady = true;
        } else if (status === 'failed') {
          throw new Error('Download preparation failed');
        }

        setDownloadProgress(Math.min(downloadProgress + 10, 90));
      }

      // Step 3: Get download URL
      const urlResponse = await api.get(`/downloads/${downloadId}/url`);
      const { downloadUrl } = urlResponse.data;

      // Step 4: Download file
      const response = await fetch(downloadUrl);
      const blob = await response.blob();

      // Step 5: Save to device
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${videoTitle}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Step 6: Mark as complete
      await api.post(`/downloads/${downloadId}/complete`, {
        deviceId: getDeviceId(),
      });

      setDownloadProgress(100);
      setDownloadComplete(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Download failed');
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  const getDeviceType = (): string => {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Download for Offline Viewing</h3>

      {!downloadComplete ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Quality
            </label>
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isDownloading}
            >
              {qualities.map((q) => (
                <option key={q.value} value={q.value}>
                  {q.label} - {q.size}
                </option>
              ))}
            </select>
          </div>

          {isDownloading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Preparing download... {downloadProgress}%
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Preparing Download...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download Video
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-3">
            Downloaded videos expire after 30 days. You can download up to 5
            videos at a time.
          </p>
        </>
      ) : (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h4 className="text-lg font-semibold mb-2">Download Complete!</h4>
          <p className="text-gray-600">
            Video has been saved to your device for offline viewing.
          </p>
        </div>
      )}
    </div>
  );
}
