// Types for email processing
export interface EmailMessage {
  id: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  headers: Record<string, string>;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  content: Buffer;
}

export interface SecurityScanResult {
  status: 'clean' | 'suspicious' | 'malicious' | 'error';
  score: number; // 0.0 to 1.0
  details: Record<string, any>;
  threats: string[];
}

export interface UrlScanResult {
  url: string;
  domain: string;
  verdict: 'safe' | 'suspicious' | 'malicious' | 'unknown';
  reputation: number;
  threats: {
    isPhishing: boolean;
    isMalware: boolean;
    isSpam: boolean;
    isSuspiciousTld: boolean;
    isUrlShortener: boolean;
    isPunycode: boolean;
  };
}

export interface AuthenticationResult {
  spf: {
    result: 'pass' | 'fail' | 'softfail' | 'neutral' | 'none' | 'temperror' | 'permerror';
    details: string;
  };
  dkim: {
    result: 'pass' | 'fail' | 'neutral' | 'policy' | 'temperror' | 'permerror';
    selector: string;
    domain: string;
  };
  dmarc: {
    result: 'pass' | 'fail' | 'temperror' | 'permerror';
    policy: 'none' | 'quarantine' | 'reject';
    alignment: boolean;
  };
}
