'use client';

import { useEffect, useRef, useState } from 'react';
import { Cast, Tv } from 'lucide-react';

interface CastPlayerProps {
  videoUrl: string;
  title: string;
  thumbnailUrl?: string;
  onCastStateChange?: (isCasting: boolean) => void;
}

export default function CastPlayer({
  videoUrl,
  title,
  thumbnailUrl,
  onCastStateChange,
}: CastPlayerProps) {
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [castSession, setCastSession] = useState<any>(null);

  useEffect(() => {
    // Initialize Google Cast
    const initializeCast = () => {
      if (window.chrome && window.chrome.cast) {
        const cast = window.chrome.cast;

        const sessionRequest = new cast.SessionRequest(
          cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        );

        const apiConfig = new cast.ApiConfig(
          sessionRequest,
          (session: any) => {
            console.log('Cast session started');
            setCastSession(session);
            setIsCasting(true);
            onCastStateChange?.(true);
          },
          (available: boolean) => {
            setIsCastAvailable(available);
          },
        );

        cast.initialize(apiConfig);
      }
    };

    // Load Google Cast API
    if (!window.chrome?.cast) {
      const script = document.createElement('script');
      script.src =
        'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
      script.async = true;
      script.onload = () => {
        window['__onGCastApiAvailable'] = (isAvailable: boolean) => {
          if (isAvailable) {
            initializeCast();
          }
        };
      };
      document.body.appendChild(script);
    } else {
      initializeCast();
    }

    // Check for AirPlay support
    if ((window as any).WebKitPlaybackTargetAvailabilityEvent) {
      console.log('AirPlay is supported');
    }
  }, [onCastStateChange]);

  const startCasting = async () => {
    if (!window.chrome?.cast) return;

    const cast = window.chrome.cast;

    try {
      const session = await new Promise((resolve, reject) => {
        cast.requestSession(
          (s: any) => resolve(s),
          (err: any) => reject(err),
        );
      });

      setCastSession(session);

      // Load media
      const mediaInfo = new cast.media.MediaInfo(videoUrl, 'video/mp4');
      mediaInfo.metadata = new cast.media.GenericMediaMetadata();
      mediaInfo.metadata.metadataType = cast.media.MetadataType.GENERIC;
      mediaInfo.metadata.title = title;

      if (thumbnailUrl) {
        mediaInfo.metadata.images = [
          new cast.media.Image(thumbnailUrl),
        ];
      }

      const request = new cast.media.LoadRequest(mediaInfo);

      (session as any).loadMedia(
        request,
        () => {
          console.log('Media loaded successfully');
          setIsCasting(true);
          onCastStateChange?.(true);
        },
        (err: any) => {
          console.error('Error loading media:', err);
        },
      );
    } catch (error) {
      console.error('Error starting cast:', error);
    }
  };

  const stopCasting = () => {
    if (castSession) {
      castSession.stop();
      setCastSession(null);
      setIsCasting(false);
      onCastStateChange?.(false);
    }
  };

  const toggleAirPlay = () => {
    // AirPlay is handled natively by the video element
    const videoElement = document.querySelector('video');
    if (videoElement && (videoElement as any).webkitShowPlaybackTargetPicker) {
      (videoElement as any).webkitShowPlaybackTargetPicker();
    }
  };

  return (
    <div className="flex gap-2">
      {/* Chromecast Button */}
      {isCastAvailable && (
        <button
          onClick={isCasting ? stopCasting : startCasting}
          className={`p-2 rounded-lg transition ${
            isCasting
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title={isCasting ? 'Stop Casting' : 'Cast to Chromecast'}
        >
          <Cast className="w-5 h-5" />
        </button>
      )}

      {/* AirPlay Button */}
      {(window as any).WebKitPlaybackTargetAvailabilityEvent && (
        <button
          onClick={toggleAirPlay}
          className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          title="Cast to AirPlay"
        >
          <Tv className="w-5 h-5" />
        </button>
      )}

      {isCasting && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          Casting to TV
        </div>
      )}
    </div>
  );
}
