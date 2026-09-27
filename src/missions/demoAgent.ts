export interface ResearchReport {
  summary: string
  findings: string[]
  opportunities: string[]
  nextActions: string[]
}

export function createDemoReport(topic: string): ResearchReport {
  const subject = topic.trim() || 'Rare Friends ecosystem opportunities for developers'

  return {
    summary: `${subject} is best approached as an identity-and-economy problem: give each Friend a useful role, make value consumption visible, and create reasons for repeated participation.`,
    findings: [
      'The Friend should remain the visible operator instead of becoming decorative branding.',
      'Recurring utility creates a stronger RF sink than a one-time cosmetic purchase.',
      'Receipts and persistent progression make each completed action part of the Friend’s history.',
    ],
    opportunities: [
      'Create paid skills that expand what an individual Friend can accomplish.',
      'Let third-party builders publish mission templates priced in RF.',
      'Use earned reputation to unlock advanced work without introducing a speculative token in the MVP.',
    ],
    nextActions: [
      'Validate one complete mission with users before adding more categories.',
      'Measure repeat missions, RF consumed, and successful completion rate.',
      'Design an on-chain provider only after the simulated economy is understandable and useful.',
    ],
  }
}
