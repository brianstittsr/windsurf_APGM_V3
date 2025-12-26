/**
 * AI SMS Review API
 * Analyzes SMS/WhatsApp message templates and provides recommendations
 */

import { NextRequest, NextResponse } from 'next/server';

interface ReviewRequest {
  messageText: string;
  messageType: 'appointment_confirmation' | 'appointment_reminder' | 'aftercare' | 'review_request' | 'promotional' | 'welcome' | 'custom';
  businessName?: string;
  targetAudience?: string;
}

interface ReviewResponse {
  score: number; // 0-100
  analysis: {
    clarity: { score: number; feedback: string };
    tone: { score: number; feedback: string };
    callToAction: { score: number; feedback: string };
    length: { score: number; feedback: string };
    compliance: { score: number; feedback: string };
  };
  suggestions: string[];
  improvedVersion: string;
  warnings: string[];
}

// SMS Best Practices Guidelines
const SMS_GUIDELINES = {
  maxLength: 160, // Standard SMS length
  optimalLength: { min: 50, max: 140 },
  requiredElements: {
    appointment_confirmation: ['client name', 'date', 'time', 'location or business name'],
    appointment_reminder: ['client name', 'date', 'time', 'pre-care instructions'],
    aftercare: ['client name', 'care instructions', 'contact info'],
    review_request: ['client name', 'review link or CTA'],
    promotional: ['offer details', 'expiration', 'CTA'],
    welcome: ['business name', 'services overview', 'CTA'],
    custom: []
  },
  toneGuidelines: {
    professional: ['avoid slang', 'proper grammar', 'respectful'],
    friendly: ['warm greeting', 'personalization', 'emoji usage (moderate)'],
    urgent: ['clear deadline', 'action required', 'consequences']
  }
};

function analyzeMessage(text: string, type: string): ReviewResponse {
  const analysis = {
    clarity: analyzeClarity(text),
    tone: analyzeTone(text, type),
    callToAction: analyzeCallToAction(text, type),
    length: analyzeLength(text),
    compliance: analyzeCompliance(text)
  };

  const overallScore = Math.round(
    (analysis.clarity.score + analysis.tone.score + analysis.callToAction.score + 
     analysis.length.score + analysis.compliance.score) / 5
  );

  const suggestions = generateSuggestions(text, type, analysis);
  const warnings = generateWarnings(text, type);
  const improvedVersion = generateImprovedVersion(text, type, analysis);

  return {
    score: overallScore,
    analysis,
    suggestions,
    improvedVersion,
    warnings
  };
}

function analyzeClarity(text: string): { score: number; feedback: string } {
  let score = 100;
  const issues: string[] = [];

  // Check for unclear abbreviations
  const unclearAbbreviations = text.match(/\b[A-Z]{2,}\b/g)?.filter(
    abbr => !['PMU', 'AM', 'PM', 'USA', 'SMS', 'URL'].includes(abbr)
  );
  if (unclearAbbreviations && unclearAbbreviations.length > 0) {
    score -= 10;
    issues.push('Contains potentially unclear abbreviations');
  }

  // Check for run-on sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const longSentences = sentences.filter(s => s.split(' ').length > 25);
  if (longSentences.length > 0) {
    score -= 15;
    issues.push('Contains long sentences that may be hard to read');
  }

  // Check for proper structure
  if (!text.includes('\n') && text.length > 200) {
    score -= 10;
    issues.push('Consider breaking into paragraphs for better readability');
  }

  // Check for personalization placeholders
  const hasPersonalization = /\{\{|\[\[|{{|<</.test(text) || 
    text.toLowerCase().includes('{{1}}') || 
    text.toLowerCase().includes('[client');
  if (!hasPersonalization && !text.toLowerCase().includes('hi ')) {
    score -= 5;
    issues.push('Consider adding personalization (client name)');
  }

  return {
    score: Math.max(0, score),
    feedback: issues.length > 0 ? issues.join('. ') : 'Message is clear and well-structured'
  };
}

function analyzeTone(text: string, type: string): { score: number; feedback: string } {
  let score = 100;
  const issues: string[] = [];

  // Check for appropriate greeting
  const hasGreeting = /^(hi|hello|hey|dear|good morning|good afternoon)/i.test(text.trim());
  if (!hasGreeting && type !== 'promotional') {
    score -= 10;
    issues.push('Consider adding a friendly greeting');
  }

  // Check emoji usage
  const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|✨|💕|🎉|⏰|📅|💰|💝|⭐|👋|✅/gu) || []).length;
  if (type === 'promotional' || type === 'welcome') {
    if (emojiCount === 0) {
      score -= 5;
      issues.push('Consider adding emojis to make the message more engaging');
    } else if (emojiCount > 8) {
      score -= 10;
      issues.push('Too many emojis may appear unprofessional');
    }
  } else if (emojiCount > 5) {
    score -= 5;
    issues.push('Consider reducing emoji usage for this message type');
  }

  // Check for overly formal or informal language
  const informalWords = ['gonna', 'wanna', 'gotta', 'ya', 'u ', 'ur ', 'thx', 'pls'];
  const hasInformal = informalWords.some(word => text.toLowerCase().includes(word));
  if (hasInformal) {
    score -= 15;
    issues.push('Avoid overly informal language');
  }

  // Check for urgency markers in non-urgent messages
  const urgencyWords = ['urgent', 'immediately', 'asap', 'now!', 'hurry'];
  const hasUrgency = urgencyWords.some(word => text.toLowerCase().includes(word));
  if (hasUrgency && !['appointment_reminder', 'promotional'].includes(type)) {
    score -= 10;
    issues.push('Urgency language may not be appropriate for this message type');
  }

  return {
    score: Math.max(0, score),
    feedback: issues.length > 0 ? issues.join('. ') : 'Tone is appropriate and professional'
  };
}

function analyzeCallToAction(text: string, type: string): { score: number; feedback: string } {
  let score = 100;
  const issues: string[] = [];

  // Check for CTA presence
  const ctaPatterns = [
    /book|schedule|call|reply|click|visit|contact|confirm|reschedule/i,
    /\?$/m, // Questions as CTAs
    /button|link/i
  ];
  const hasCTA = ctaPatterns.some(pattern => pattern.test(text));

  if (!hasCTA && type !== 'aftercare') {
    score -= 20;
    issues.push('Missing clear call-to-action');
  }

  // Check for multiple CTAs (can be confusing)
  const ctaCount = (text.match(/book|schedule|call|reply|click|visit|contact/gi) || []).length;
  if (ctaCount > 3) {
    score -= 10;
    issues.push('Too many calls-to-action may confuse the recipient');
  }

  // Check for actionable language
  const actionableWords = ['book now', 'reply', 'call us', 'click here', 'schedule', 'confirm'];
  const hasActionable = actionableWords.some(word => text.toLowerCase().includes(word));
  if (!hasActionable && ['promotional', 'review_request', 'welcome'].includes(type)) {
    score -= 15;
    issues.push('Consider adding more actionable language');
  }

  return {
    score: Math.max(0, score),
    feedback: issues.length > 0 ? issues.join('. ') : 'Call-to-action is clear and effective'
  };
}

function analyzeLength(text: string): { score: number; feedback: string } {
  let score = 100;
  const charCount = text.length;
  const wordCount = text.split(/\s+/).length;

  if (charCount > 500) {
    score -= 30;
    return { score, feedback: `Message is too long (${charCount} chars). Consider shortening to under 300 characters for better engagement.` };
  } else if (charCount > 300) {
    score -= 15;
    return { score, feedback: `Message is lengthy (${charCount} chars). Consider trimming for better readability.` };
  } else if (charCount < 30) {
    score -= 20;
    return { score, feedback: `Message is very short (${charCount} chars). Consider adding more context.` };
  }

  return { score, feedback: `Good length (${charCount} chars, ${wordCount} words)` };
}

function analyzeCompliance(text: string): { score: number; feedback: string } {
  let score = 100;
  const issues: string[] = [];

  // Check for opt-out information (required for marketing)
  const hasOptOut = /opt.?out|unsubscribe|stop|reply stop/i.test(text);
  // Note: Not penalizing for missing opt-out as these are transactional messages

  // Check for business identification
  const hasBusinessId = /atlanta glamour|pmu|permanent makeup|a pretty girl matter/i.test(text);
  if (!hasBusinessId) {
    score -= 5;
    issues.push('Consider including business name for brand recognition');
  }

  // Check for potentially problematic content
  const problematicPatterns = [
    { pattern: /guarantee|100%|promise/i, issue: 'Avoid absolute guarantees' },
    { pattern: /free(?!\s+consultation)/i, issue: 'Be careful with "free" claims' },
    { pattern: /\$\d+\s*off/i, issue: 'Ensure discount claims are accurate' }
  ];

  problematicPatterns.forEach(({ pattern, issue }) => {
    if (pattern.test(text)) {
      score -= 5;
      issues.push(issue);
    }
  });

  return {
    score: Math.max(0, score),
    feedback: issues.length > 0 ? issues.join('. ') : 'Message follows compliance best practices'
  };
}

function generateSuggestions(text: string, type: string, analysis: any): string[] {
  const suggestions: string[] = [];

  // Based on analysis scores
  if (analysis.clarity.score < 80) {
    suggestions.push('Break long sentences into shorter, clearer statements');
    suggestions.push('Use bullet points or line breaks for lists');
  }

  if (analysis.tone.score < 80) {
    suggestions.push('Add a warm, personalized greeting');
    suggestions.push('Balance professionalism with friendliness');
  }

  if (analysis.callToAction.score < 80) {
    suggestions.push('Add a clear, single call-to-action');
    suggestions.push('Use action verbs like "Book", "Reply", or "Confirm"');
  }

  if (analysis.length.score < 80) {
    if (text.length > 300) {
      suggestions.push('Remove redundant phrases');
      suggestions.push('Focus on the most important information');
    } else {
      suggestions.push('Add relevant details to provide more value');
    }
  }

  // Type-specific suggestions
  switch (type) {
    case 'appointment_confirmation':
      if (!text.includes('📅') && !text.includes('date')) {
        suggestions.push('Clearly highlight the appointment date and time');
      }
      if (!text.toLowerCase().includes('location') && !text.toLowerCase().includes('address')) {
        suggestions.push('Include location or address information');
      }
      break;
    case 'appointment_reminder':
      if (!text.toLowerCase().includes('pre-care') && !text.toLowerCase().includes('prepare')) {
        suggestions.push('Add pre-appointment care instructions');
      }
      break;
    case 'aftercare':
      if (!text.toLowerCase().includes('question') && !text.toLowerCase().includes('contact')) {
        suggestions.push('Include contact information for questions');
      }
      break;
    case 'review_request':
      if (!text.toLowerCase().includes('thank')) {
        suggestions.push('Start with a thank you for their business');
      }
      break;
    case 'promotional':
      if (!text.toLowerCase().includes('valid') && !text.toLowerCase().includes('expires')) {
        suggestions.push('Add offer expiration date to create urgency');
      }
      break;
  }

  return suggestions.slice(0, 5); // Return top 5 suggestions
}

function generateWarnings(text: string, type: string): string[] {
  const warnings: string[] = [];

  // Check for sensitive content
  if (/pain|hurt|bleed|scar/i.test(text) && type !== 'aftercare') {
    warnings.push('⚠️ Contains potentially alarming medical terms');
  }

  // Check for pricing without context
  if (/\$\d+/.test(text) && !text.toLowerCase().includes('deposit') && !text.toLowerCase().includes('off')) {
    warnings.push('⚠️ Includes pricing - ensure it\'s current and accurate');
  }

  // Check for external links
  if (/https?:\/\//.test(text)) {
    warnings.push('⚠️ Contains external link - verify it\'s working and secure');
  }

  // Check for time-sensitive content
  if (/today|tomorrow|this week/i.test(text)) {
    warnings.push('⚠️ Contains time-sensitive language - ensure automated timing is correct');
  }

  return warnings;
}

function generateImprovedVersion(text: string, type: string, analysis: any): string {
  let improved = text;

  // Add greeting if missing
  if (analysis.tone.score < 90 && !/^(hi|hello|hey|dear)/i.test(text.trim())) {
    improved = 'Hi {{1}},\n\n' + improved;
  }

  // Add business signature if missing
  if (analysis.compliance.score < 90 && !/atlanta glamour|pmu|a pretty girl matter/i.test(text)) {
    improved = improved.trim() + '\n\n- A Pretty Girl Matter PMU';
  }

  // Add CTA if missing
  if (analysis.callToAction.score < 70) {
    switch (type) {
      case 'appointment_confirmation':
        improved += '\n\nReply to confirm or reschedule!';
        break;
      case 'review_request':
        improved += '\n\nTap the link above to share your experience! ⭐';
        break;
      case 'promotional':
        improved += '\n\nBook now before this offer expires!';
        break;
      case 'welcome':
        improved += '\n\nReply to this message to get started!';
        break;
    }
  }

  return improved;
}

export async function POST(request: NextRequest) {
  try {
    const body: ReviewRequest = await request.json();
    const { messageText, messageType, businessName, targetAudience } = body;

    if (!messageText) {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      );
    }

    const review = analyzeMessage(messageText, messageType || 'custom');

    return NextResponse.json({
      success: true,
      review,
      metadata: {
        messageLength: messageText.length,
        wordCount: messageText.split(/\s+/).length,
        messageType: messageType || 'custom',
        analyzedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('AI SMS Review error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze message', details: error.message },
      { status: 500 }
    );
  }
}
