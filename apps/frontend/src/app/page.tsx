'use client';

import Link from 'next/link';
import { Play, Video, BarChart3, Users, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Enterprise Video Streaming Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Secure, scalable video streaming for corporate communication,
            training, and live events
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <Link
              href="/demo"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition"
            >
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={<Video className="w-10 h-10 text-blue-600" />}
            title="Live Streaming"
            description="Stream live events to 10,000+ concurrent viewers with real-time chat and Q&A"
          />
          <FeatureCard
            icon={<Play className="w-10 h-10 text-blue-600" />}
            title="Video On Demand"
            description="Upload, manage, and share video content with automatic transcoding"
          />
          <FeatureCard
            icon={<BarChart3 className="w-10 h-10 text-blue-600" />}
            title="Analytics"
            description="Track engagement, completion rates, and viewer behavior"
          />
          <FeatureCard
            icon={<Shield className="w-10 h-10 text-blue-600" />}
            title="Enterprise Security"
            description="SSO integration, role-based access control, and audit logs"
          />
          <FeatureCard
            icon={<Users className="w-10 h-10 text-blue-600" />}
            title="Interactive Features"
            description="Engage viewers with live polls, quizzes, and Q&A sessions"
          />
          <FeatureCard
            icon={<Zap className="w-10 h-10 text-blue-600" />}
            title="AI Transcription"
            description="Automatic speech-to-text with multi-language support"
          />
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mt-20 text-center">
          <StatCard number="10,000+" label="Concurrent Viewers" />
          <StatCard number="99.95%" label="Uptime SLA" />
          <StatCard number="<2s" label="Video Start Time" />
          <StatCard number="1080p" label="HD Streaming" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-3xl font-bold text-blue-600 mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}
