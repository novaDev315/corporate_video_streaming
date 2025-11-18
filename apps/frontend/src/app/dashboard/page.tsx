'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Video, Play, BarChart3, Upload } from 'lucide-react';
import { videosApi, streamsApi } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalStreams: 0,
    totalViews: 0,
    totalWatchTime: 0,
  });
  const [recentVideos, setRecentVideos] = useState([]);
  const [upcomingStreams, setUpcomingStreams] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [videosRes, streamsRes] = await Promise.all([
        videosApi.getAll(),
        streamsApi.getAll(),
      ]);

      setRecentVideos(videosRes.data.slice(0, 5));
      setUpcomingStreams(streamsRes.data.slice(0, 5));
      setStats({
        totalVideos: videosRes.data.length,
        totalStreams: streamsRes.data.length,
        totalViews: 12500, // TODO: Get from analytics
        totalWatchTime: 45000, // TODO: Get from analytics
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            icon={<Video className="w-6 h-6" />}
            label="Total Videos"
            value={stats.totalVideos}
            color="bg-blue-500"
          />
          <StatsCard
            icon={<Play className="w-6 h-6" />}
            label="Live Streams"
            value={stats.totalStreams}
            color="bg-green-500"
          />
          <StatsCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Total Views"
            value={stats.totalViews.toLocaleString()}
            color="bg-purple-500"
          />
          <StatsCard
            icon={<Upload className="w-6 h-6" />}
            label="Watch Time (hrs)"
            value={Math.round(stats.totalWatchTime / 3600)}
            color="bg-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/videos/upload"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition text-center"
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold">Upload Video</h3>
          </Link>
          <Link
            href="/streams/create"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition text-center"
          >
            <Play className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold">Start Live Stream</h3>
          </Link>
          <Link
            href="/analytics"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition text-center"
          >
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold">View Analytics</h3>
          </Link>
        </div>

        {/* Recent Videos */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Recent Videos</h2>
          </div>
          <div className="p-6">
            {recentVideos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No videos yet. Upload your first video!
              </p>
            ) : (
              <div className="space-y-4">
                {recentVideos.map((video: any) => (
                  <VideoRow key={video.id} video={video} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Streams */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Upcoming Streams</h2>
          </div>
          <div className="p-6">
            {upcomingStreams.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No upcoming streams scheduled.
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingStreams.map((stream: any) => (
                  <StreamRow key={stream.id} stream={stream} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatsCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${color} p-3 rounded-md text-white`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {label}
              </dt>
              <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoRow({ video }: { video: any }) {
  return (
    <Link
      href={`/videos/${video.id}`}
      className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition"
    >
      <div className="w-40 h-24 bg-gray-200 rounded-md mr-4">
        {video.thumbnailUrl && (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover rounded-md"
          />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{video.title}</h3>
        <p className="text-sm text-gray-500">{video.description}</p>
        <div className="flex gap-4 mt-2 text-sm text-gray-500">
          <span>{video.viewCount || 0} views</span>
          <span>{video.status}</span>
        </div>
      </div>
    </Link>
  );
}

function StreamRow({ stream }: { stream: any }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
      <div>
        <h3 className="font-semibold">{stream.title}</h3>
        <p className="text-sm text-gray-500">{stream.description}</p>
        <span className="text-sm text-gray-500">{stream.status}</span>
      </div>
      <Link
        href={`/streams/${stream.id}`}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        View
      </Link>
    </div>
  );
}
