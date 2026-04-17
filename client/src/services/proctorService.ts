import { interviewAPI } from '../utils/api';

export interface ProctorEvent {
  type: 'tab_switch' | 'copy_paste' | 'screenshot' | 'window_blur' | 'suspicious_pattern' | 'ai_detection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  details: string;
  evidence?: string;
}

export interface ProctorSession {
  interviewId: number;
  events: ProctorEvent[];
  riskScore: number;
  flagged: boolean;
}

class ProctorService {
  private sessionEvents: ProctorEvent[] = [];
  private interviewId: number | null = null;
  private tabSwitchCount = 0;
  private copyPasteCount = 0;
  private windowBlurCount = 0;
  private lastActivityTime = Date.now();
  private suspiciousPatternDetected = false;

  // AI-generated text detection patterns
  private aiPatterns = [
    /^(certainly|absolutely|of course|i'd be happy to|let me explain|the key points?|in summary|to summarize)/i,
    /\b(furthermore|moreover|in addition|consequently|therefore|thus|hence)\b/gi,
    /\b(utilize|leverage|synergize|paradigm|holistic|ecosystem)\b/gi,
    /\b(as mentioned|as stated|as discussed|as noted)\b/gi,
  ];

  initialize(interviewId: number) {
    this.interviewId = interviewId;
    this.sessionEvents = [];
    this.setupListeners();
  }

  private setupListeners() {
    // Detect tab/window switching
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    window.addEventListener('blur', () => this.handleWindowBlur());
    window.addEventListener('focus', () => this.handleWindowFocus());

    // Detect copy-paste attempts
    document.addEventListener('copy', (e) => this.handleCopyAttempt(e));
    document.addEventListener('paste', (e) => this.handlePasteAttempt(e));

    // Detect right-click (inspect element)
    document.addEventListener('contextmenu', (e) => this.handleContextMenu(e));

    // Detect keyboard shortcuts for developer tools
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

    // Monitor for suspicious activity patterns
    document.addEventListener('keyup', () => this.analyzeTypingPattern());
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      this.tabSwitchCount++;
      const severity = this.tabSwitchCount > 3 ? 'high' : 'medium';
      this.logEvent({
        type: 'tab_switch',
        severity,
        details: `Tab switched away (${this.tabSwitchCount} times)`,
        timestamp: new Date()
      });
    }
  }

  private handleWindowBlur() {
    this.windowBlurCount++;
    const severity = this.windowBlurCount > 5 ? 'high' : 'medium';
    this.logEvent({
      type: 'window_blur',
      severity,
      details: `Window lost focus (${this.windowBlurCount} times)`,
      timestamp: new Date()
    });
  }

  private handleWindowFocus() {
    this.lastActivityTime = Date.now();
  }

  private handleCopyAttempt(e: ClipboardEvent) {
    this.copyPasteCount++;
    const copiedText = e.clipboardData?.getData('text') || '';
    
    this.logEvent({
      type: 'copy_paste',
      severity: 'high',
      details: `Copy attempt detected (${this.copyPasteCount} times)`,
      evidence: copiedText.substring(0, 100),
      timestamp: new Date()
    });

    // Prevent copying from interview area
    if (this.isInInterviewArea(e.target as HTMLElement)) {
      e.preventDefault();
    }
  }

  private handlePasteAttempt(e: ClipboardEvent) {
    this.copyPasteCount++;
    const pastedText = e.clipboardData?.getData('text') || '';

    this.logEvent({
      type: 'copy_paste',
      severity: 'critical',
      details: `Paste attempt detected (${this.copyPasteCount} times)`,
      evidence: pastedText.substring(0, 100),
      timestamp: new Date()
    });

    // Prevent pasting into response area
    if (this.isInResponseArea(e.target as HTMLElement)) {
      e.preventDefault();
    }
  }

  private handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    this.logEvent({
      type: 'suspicious_pattern',
      severity: 'medium',
      details: 'Right-click context menu attempted',
      timestamp: new Date()
    });
  }

  private handleKeyboardShortcuts(e: KeyboardEvent) {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'u')
    ) {
      e.preventDefault();
      this.logEvent({
        type: 'suspicious_pattern',
        severity: 'high',
        details: 'Developer tools access attempt detected',
        timestamp: new Date()
      });
    }
  }

  private analyzeTypingPattern() {
    const currentTime = Date.now();
    const timeSinceLastActivity = currentTime - this.lastActivityTime;
    this.lastActivityTime = currentTime;

    // Detect suspiciously fast typing (potential paste)
    if (timeSinceLastActivity < 50 && timeSinceLastActivity > 0) {
      this.suspiciousPatternDetected = true;
    }
  }

  detectAIGeneratedText(text: string): { isAI: boolean; confidence: number; patterns: string[] } {
    const detectedPatterns: string[] = [];
    let matchCount = 0;

    for (const pattern of this.aiPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matchCount += matches.length;
        detectedPatterns.push(pattern.source);
      }
    }

    // Check for unnatural sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = text.split(/\s+/).length / sentences.length;
    
    if (avgSentenceLength > 25) {
      detectedPatterns.push('unusually_long_sentences');
      matchCount++;
    }

    // Check for perfect grammar (suspicious for real-time responses)
    const grammarScore = this.analyzeGrammar(text);
    if (grammarScore > 0.95) {
      detectedPatterns.push('perfect_grammar');
      matchCount++;
    }

    const confidence = Math.min((matchCount / 5) * 100, 100);
    const isAI = confidence > 60;

    if (isAI) {
      this.logEvent({
        type: 'ai_detection',
        severity: 'critical',
        details: `AI-generated text detected (confidence: ${confidence.toFixed(1)}%)`,
        evidence: detectedPatterns.join(', '),
        timestamp: new Date()
      });
    }

    return { isAI, confidence, patterns: detectedPatterns };
  }

  private analyzeGrammar(text: string): number {
    // Simple grammar analysis - check for common errors
    const commonErrors = [
      /\b(their|there|they're)\b/gi,
      /\b(your|you're)\b/gi,
      /\b(its|it's)\b/gi,
      /\b(to|too|two)\b/gi,
    ];

    let errorCount = 0;
    for (const pattern of commonErrors) {
      const matches = text.match(pattern);
      if (matches) errorCount += matches.length;
    }

    return Math.max(0, 1 - (errorCount / (text.split(/\s+/).length / 10)));
  }

  private isInInterviewArea(element: HTMLElement): boolean {
    return element.closest('[data-interview-area]') !== null;
  }

  private isInResponseArea(element: HTMLElement): boolean {
    return element.closest('textarea') !== null || element.closest('[data-response-area]') !== null;
  }

  private logEvent(event: ProctorEvent) {
    this.sessionEvents.push(event);
    console.warn(`[Proctor] ${event.type}: ${event.details}`);
  }

  public recordEvent(event: ProctorEvent) {
    this.logEvent(event);
  }

  getRiskScore(): number {
    let score = 0;

    // Tab switching: +10 per switch (max 50)
    score += Math.min(this.tabSwitchCount * 10, 50);

    // Copy-paste attempts: +20 per attempt (max 60)
    score += Math.min(this.copyPasteCount * 20, 60);

    // Window blur: +5 per blur (max 30)
    score += Math.min(this.windowBlurCount * 5, 30);

    // Suspicious patterns: +15
    if (this.suspiciousPatternDetected) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  getSessionReport(): ProctorSession {
    return {
      interviewId: this.interviewId || 0,
      events: this.sessionEvents,
      riskScore: this.getRiskScore(),
      flagged: this.getRiskScore() > 50
    };
  }

  async submitReport() {
    if (!this.interviewId) return;

    try {
      const report = this.getSessionReport();
      await interviewAPI.submitProctorReport({
        interviewId: this.interviewId,
        report
      });
    } catch (error) {
      console.error('Failed to submit proctor report:', error);
    }
  }

  destroy() {
    // Cleanup listeners if needed
    this.sessionEvents = [];
  }
}

export const proctorService = new ProctorService();
