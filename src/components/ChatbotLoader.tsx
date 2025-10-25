'use client';

import dynamic from 'next/dynamic';

const PMUChatbot = dynamic(() => import('./PMUChatbot'), {
  ssr: false,
});

export default function ChatbotLoader() {
  return <PMUChatbot />;
}
