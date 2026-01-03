import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Fetch all FAQs from Firestore
async function fetchAllFAQs(): Promise<FAQItem[]> {
  const db = getDb();
  const faqsRef = collection(db, 'faqs');
  const snapshot = await getDocs(faqsRef);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    question: doc.data().question || '',
    answer: doc.data().answer || '',
    category: doc.data().category || 'general',
  }));
}

// Calculate similarity score between query and text
function calculateSimilarity(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const textLower = text.toLowerCase();
  
  let matchCount = 0;
  let totalWeight = 0;
  
  for (const word of queryWords) {
    if (textLower.includes(word)) {
      matchCount++;
      // Give more weight to longer words
      totalWeight += word.length;
    }
  }
  
  if (queryWords.length === 0) return 0;
  
  // Combine match ratio with weighted score
  const matchRatio = matchCount / queryWords.length;
  const weightedScore = totalWeight / (queryWords.join('').length || 1);
  
  return (matchRatio * 0.6) + (weightedScore * 0.4);
}

// Find relevant FAQs based on user query
function findRelevantFAQs(query: string, faqs: FAQItem[], topN: number = 3): FAQItem[] {
  const scored = faqs.map(faq => {
    const questionScore = calculateSimilarity(query, faq.question) * 1.5; // Weight questions higher
    const answerScore = calculateSimilarity(query, faq.answer);
    const categoryScore = query.toLowerCase().includes(faq.category) ? 0.3 : 0;
    
    return {
      faq,
      score: questionScore + answerScore + categoryScore,
    };
  });
  
  return scored
    .filter(s => s.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(s => s.faq);
}

// Generate a helpful response based on relevant FAQs
function generateResponse(query: string, relevantFAQs: FAQItem[], allFAQs: FAQItem[]): string {
  const lowerQuery = query.toLowerCase();
  
  // Handle greetings
  if (lowerQuery.match(/^(hi|hello|hey|help|start)/)) {
    return `Hello! 👋 I'm your FAQ assistant. I can help you find answers about:

• **Creating Clients** - How to add and manage client accounts
• **Managing Bookings** - Creating, editing, and tracking appointments
• **Procedure Notes** - Adding and managing notes for each booking
• **General** - Dashboard access and navigation

What would you like to know? Just ask me a question!`;
  }
  
  // Handle category-specific queries
  if (lowerQuery.includes('client') && (lowerQuery.includes('all') || lowerQuery.includes('list') || lowerQuery.includes('show'))) {
    const clientFAQs = allFAQs.filter(f => f.category === 'clients');
    if (clientFAQs.length > 0) {
      const list = clientFAQs.map(f => `• **${f.question}**`).join('\n');
      return `Here are all the FAQs about **Creating Clients**:\n\n${list}\n\nClick on any question in the FAQ list to see the full answer, or ask me a specific question!`;
    }
  }
  
  if (lowerQuery.includes('booking') && (lowerQuery.includes('all') || lowerQuery.includes('list') || lowerQuery.includes('show'))) {
    const bookingFAQs = allFAQs.filter(f => f.category === 'bookings');
    if (bookingFAQs.length > 0) {
      const list = bookingFAQs.map(f => `• **${f.question}**`).join('\n');
      return `Here are all the FAQs about **Managing Bookings**:\n\n${list}\n\nClick on any question in the FAQ list to see the full answer, or ask me a specific question!`;
    }
  }
  
  if (lowerQuery.includes('note') && (lowerQuery.includes('all') || lowerQuery.includes('list') || lowerQuery.includes('show'))) {
    const noteFAQs = allFAQs.filter(f => f.category === 'notes');
    if (noteFAQs.length > 0) {
      const list = noteFAQs.map(f => `• **${f.question}**`).join('\n');
      return `Here are all the FAQs about **Procedure Notes**:\n\n${list}\n\nClick on any question in the FAQ list to see the full answer, or ask me a specific question!`;
    }
  }
  
  // If we found relevant FAQs, provide the answer
  if (relevantFAQs.length > 0) {
    const bestMatch = relevantFAQs[0];
    
    // Format the answer with markdown
    let response = `**${bestMatch.question}**\n\n${bestMatch.answer}`;
    
    // If there are other relevant FAQs, suggest them
    if (relevantFAQs.length > 1) {
      const otherQuestions = relevantFAQs.slice(1).map(f => `• ${f.question}`).join('\n');
      response += `\n\n---\n\n**Related questions you might find helpful:**\n${otherQuestions}`;
    }
    
    return response;
  }
  
  // No matches found - provide helpful suggestions
  const categories = [...new Set(allFAQs.map(f => f.category))];
  const sampleQuestions = allFAQs.slice(0, 3).map(f => `• "${f.question}"`).join('\n');
  
  return `I couldn't find a specific answer for that question. Here are some things you can try:

**Ask about:**
• How to create a new client
• How to add a booking
• How to add procedure notes
• How to view booking details
• How to change appointment times

**Or try questions like:**
${sampleQuestions}

You can also browse the FAQ categories above to find what you're looking for!`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;
    
    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Fetch all FAQs
    const allFAQs = await fetchAllFAQs();
    
    // Find relevant FAQs
    const relevantFAQs = findRelevantFAQs(message, allFAQs);
    
    // Generate response
    const response = generateResponse(message, relevantFAQs, allFAQs);
    
    return NextResponse.json({
      success: true,
      message: response,
      matchedFAQs: relevantFAQs.map(f => f.id),
    });
  } catch (error: any) {
    console.error('FAQ chat error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
