import React from "react";
export default function VoiceButton({ text }) {
  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button className="voice-btn" onClick={speak}>
      🔊 Voice
    </button>
  );
}