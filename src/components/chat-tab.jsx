'use client'

import { useEffect, useRef } from "react";
import ChatMessage from "./chat-message";

export default function ChatTab({ messages, onTTS }) {
  const scrollAreaRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div>
      <div className="p-2 whitespace-pre-wrap max-w-full overflow-x-hidden overflow-y-auto scrollable-container" ref={scrollAreaRef}>
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            onTTS={() => onTTS(message.chatmessage, message.chatname)}
          />
        ))}
      </div>
    </div>
  );
}
