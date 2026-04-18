import React, { useEffect, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoPreviewModalProps {
  isOpen: boolean;
  videoUrl: string;
  onClose: () => void;
  onConfirm: () => void;
  onRetake: () => void;
  isLoading?: boolean;
}

const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  isOpen,
  videoUrl,
  onClose,
  onConfirm,
  onRetake,
  isLoading = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Preview Your Response</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Video Container */}
        <div className="bg-black relative aspect-video">
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            className="w-full h-full"
          />

          {/* Play Button Overlay */}
          {!isPlaying && (
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors group"
            >
              <Play className="w-16 h-16 text-white fill-white group-hover:scale-110 transition-transform" />
            </button>
          )}

          {/* Pause Button */}
          {isPlaying && (
            <button
              onClick={handlePlayPause}
              className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <Pause className="w-6 h-6 text-white fill-white" />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-50 p-6 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleMuteToggle}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-gray-600" />
              ) : (
                <Volume2 className="w-5 h-5 text-gray-600" />
              )}
            </button>

            <div className="flex gap-3">
              <button
                onClick={onRetake}
                disabled={isLoading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Retake
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Response'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreviewModal;
