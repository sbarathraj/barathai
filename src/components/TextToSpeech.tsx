
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface TextToSpeechProps {
  text: string;
  className?: string;
}

export const TextToSpeech: React.FC<TextToSpeechProps> = ({ text, className = "" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!speechSupported) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSpeak}
      className={`h-6 w-6 text-slate-400 hover:text-blue-400 transition-colors ${className}`}
      title={isPlaying ? "Stop speaking" : "Read aloud"}
    >
      {isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
    </Button>
  );
};
