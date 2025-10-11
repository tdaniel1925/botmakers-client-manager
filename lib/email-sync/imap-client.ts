/**
 * IMAP Email Client
 * Universal IMAP client for fetching emails from any provider
 */

import Imap from 'imap';
import { simpleParser, ParsedMail, AddressObject } from 'mailparser';
import type { EmailMessage, EmailAddress } from '../email-types';

// ============================================================================
// Types
// ============================================================================

export interface ImapConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  tls?: boolean;
  authTimeout?: number;
  connTimeout?: number;
  keepalive?: boolean;
}

export interface ImapFetchOptions {
  since?: Date;
  before?: Date;
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  seen?: boolean;
  answered?: boolean;
  flagged?: boolean;
  deleted?: boolean;
  draft?: boolean;
  limit?: number;
  uids?: number[];
}

export interface ImapFetchResult {
  emails: Partial<EmailMessage>[];
  highestUid: number;
  totalFetched: number;
}

// ============================================================================
// IMAP Client Class
// ============================================================================

export class ImapClient {
  private imap: Imap;
  private connected: boolean = false;

  constructor(config: ImapConfig) {
    this.imap = new Imap({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      tls: config.tls ?? true,
      tlsOptions: { rejectUnauthorized: false }, // Allow self-signed certs
      authTimeout: config.authTimeout ?? 10000,
      connTimeout: config.connTimeout ?? 10000,
      keepalive: config.keepalive ?? true,
    });

    this.setupEventHandlers();
  }

  /**
   * Setup IMAP event handlers
   */
  private setupEventHandlers() {
    this.imap.once('ready', () => {
      this.connected = true;
      console.log('IMAP connection ready');
    });

    this.imap.once('error', (err: Error) => {
      console.error('IMAP error:', err);
      this.connected = false;
    });

    this.imap.once('end', () => {
      console.log('IMAP connection ended');
      this.connected = false;
    });
  }

  /**
   * Connect to IMAP server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        this.connected = true;
        resolve();
      });

      this.imap.once('error', (err: Error) => {
        reject(err);
      });

      this.imap.connect();

      // Timeout after 15 seconds
      setTimeout(() => {
        if (!this.connected) {
          reject(new Error('IMAP connection timeout'));
        }
      }, 15000);
    });
  }

  /**
   * Disconnect from IMAP server
   */
  disconnect(): void {
    if (this.connected) {
      this.imap.end();
      this.connected = false;
    }
  }

  /**
   * Test IMAP connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.connect();
      
      // Try to list folders to verify connection works
      const boxes = await this.listMailboxes();
      
      this.disconnect();
      
      return boxes.length > 0;
    } catch (error) {
      console.error('IMAP test connection failed:', error);
      return false;
    }
  }

  /**
   * List mailboxes/folders
   */
  async listMailboxes(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.imap.getBoxes((err, boxes) => {
        if (err) {
          reject(err);
          return;
        }

        const flattenBoxes = (boxObj: any, prefix = ''): string[] => {
          const result: string[] = [];
          for (const key in boxObj) {
            const fullPath = prefix ? `${prefix}${boxObj.delimiter}${key}` : key;
            result.push(fullPath);
            if (boxObj[key].children) {
              result.push(...flattenBoxes(boxObj[key].children, fullPath));
            }
          }
          return result;
        };

        resolve(flattenBoxes(boxes));
      });
    });
  }

  /**
   * Open mailbox
   */
  private async openBox(boxName: string = 'INBOX', readOnly: boolean = false): Promise<any> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(boxName, readOnly, (err, box) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(box);
      });
    });
  }

  /**
   * Build IMAP search criteria from options
   */
  private buildSearchCriteria(options: ImapFetchOptions = {}): any[] {
    const criteria: any[] = [];

    if (options.since) {
      criteria.push(['SINCE', options.since]);
    }

    if (options.before) {
      criteria.push(['BEFORE', options.before]);
    }

    if (options.from) {
      criteria.push(['FROM', options.from]);
    }

    if (options.to) {
      criteria.push(['TO', options.to]);
    }

    if (options.subject) {
      criteria.push(['SUBJECT', options.subject]);
    }

    if (options.body) {
      criteria.push(['BODY', options.body]);
    }

    if (options.seen !== undefined) {
      criteria.push(options.seen ? 'SEEN' : 'UNSEEN');
    }

    if (options.answered !== undefined) {
      criteria.push(options.answered ? 'ANSWERED' : 'UNANSWERED');
    }

    if (options.flagged !== undefined) {
      criteria.push(options.flagged ? 'FLAGGED' : 'UNFLAGGED');
    }

    if (options.deleted !== undefined) {
      criteria.push(options.deleted ? 'DELETED' : 'UNDELETED');
    }

    if (options.draft !== undefined) {
      criteria.push(options.draft ? 'DRAFT' : 'UNDRAFT');
    }

    // If no criteria, return ALL
    return criteria.length > 0 ? criteria : ['ALL'];
  }

  /**
   * Fetch emails from mailbox
   */
  async fetchEmails(
    boxName: string = 'INBOX',
    options: ImapFetchOptions = {}
  ): Promise<ImapFetchResult> {
    await this.openBox(boxName, true);

    // Search for messages
    const uids = options.uids || await this.searchEmails(options);

    if (uids.length === 0) {
      return {
        emails: [],
        highestUid: 0,
        totalFetched: 0,
      };
    }

    // Apply limit
    const limitedUids = options.limit ? uids.slice(0, options.limit) : uids;

    // Fetch message details
    const emails = await this.fetchMessagesByUids(limitedUids);

    return {
      emails,
      highestUid: Math.max(...limitedUids),
      totalFetched: emails.length,
    };
  }

  /**
   * Search for message UIDs matching criteria
   */
  private async searchEmails(options: ImapFetchOptions = {}): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const criteria = this.buildSearchCriteria(options);

      this.imap.search(criteria, (err, uids) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(uids || []);
      });
    });
  }

  /**
   * Fetch messages by UIDs
   */
  private async fetchMessagesByUids(uids: number[]): Promise<Partial<EmailMessage>[]> {
    return new Promise((resolve, reject) => {
      const emails: Partial<EmailMessage>[] = [];
      
      const fetch = this.imap.fetch(uids, {
        bodies: '',
        struct: true,
      });

      fetch.on('message', (msg, seqno) => {
        let buffer = '';
        let attributes: any = null;

        msg.on('body', (stream) => {
          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });
        });

        msg.once('attributes', (attrs) => {
          attributes = attrs;
        });

        msg.once('end', async () => {
          try {
            // Parse email using mailparser
            const parsed = await simpleParser(buffer);
            const email = this.parseToEmailMessage(parsed, attributes);
            emails.push(email);
          } catch (error) {
            console.error('Error parsing email:', error);
          }
        });
      });

      fetch.once('error', (err) => {
        reject(err);
      });

      fetch.once('end', () => {
        resolve(emails);
      });
    });
  }

  /**
   * Parse mailparser result to our EmailMessage format
   */
  private parseToEmailMessage(
    parsed: ParsedMail,
    attributes: any
  ): Partial<EmailMessage> {
    const from = this.parseAddress(parsed.from);
    const to = this.parseAddressList(parsed.to);
    const cc = this.parseAddressList(parsed.cc);
    const bcc = this.parseAddressList(parsed.bcc);
    const replyTo = this.parseAddressList(parsed.replyTo);

    // Extract flags
    const flags = attributes.flags || [];
    const isRead = flags.includes('\\Seen');
    const isStarred = flags.includes('\\Flagged');
    const isAnswered = flags.includes('\\Answered');
    const isDraft = flags.includes('\\Draft');
    const isDeleted = flags.includes('\\Deleted');

    return {
      messageId: parsed.messageId || '',
      inReplyTo: parsed.inReplyTo,
      references: parsed.references || [],
      fromAddress: from,
      toAddresses: to,
      ccAddresses: cc.length > 0 ? cc : undefined,
      bccAddresses: bcc.length > 0 ? bcc : undefined,
      replyToAddresses: replyTo.length > 0 ? replyTo : undefined,
      subject: parsed.subject || '(No Subject)',
      snippet: parsed.text ? parsed.text.substring(0, 150) : undefined,
      bodyText: parsed.text,
      bodyHtml: parsed.html ? parsed.html.toString() : undefined,
      receivedAt: parsed.date || new Date(),
      isRead,
      isStarred,
      isDraft,
      hasAttachments: (parsed.attachments?.length || 0) > 0,
      // Store UID for tracking
      externalId: attributes.uid?.toString(),
    };
  }

  /**
   * Parse single email address
   */
  private parseAddress(addr: any): EmailAddress {
    if (!addr) {
      return { email: '' };
    }

    if (typeof addr === 'string') {
      return { email: addr };
    }

    const addressObj = addr as AddressObject;
    const first = addressObj.value?.[0];

    if (!first) {
      return { email: '' };
    }

    return {
      name: first.name,
      email: first.address || '',
    };
  }

  /**
   * Parse list of email addresses
   */
  private parseAddressList(addr: any): EmailAddress[] {
    if (!addr) {
      return [];
    }

    if (typeof addr === 'string') {
      return [{ email: addr }];
    }

    const addressObj = addr as AddressObject;
    
    return (addressObj.value || []).map((item) => ({
      name: item.name,
      email: item.address || '',
    }));
  }

  /**
   * Fetch new emails since last UID
   */
  async fetchNewEmails(
    boxName: string = 'INBOX',
    lastUid: number = 0,
    limit?: number
  ): Promise<ImapFetchResult> {
    await this.openBox(boxName, true);

    // Search for UIDs greater than lastUid
    const allUids = await this.searchEmails({});
    const newUids = allUids.filter((uid) => uid > lastUid);

    if (newUids.length === 0) {
      return {
        emails: [],
        highestUid: lastUid,
        totalFetched: 0,
      };
    }

    // Sort UIDs (oldest first)
    newUids.sort((a, b) => a - b);

    // Apply limit
    const limitedUids = limit ? newUids.slice(0, limit) : newUids;

    // Fetch messages
    const emails = await this.fetchMessagesByUids(limitedUids);

    return {
      emails,
      highestUid: Math.max(...limitedUids),
      totalFetched: emails.length,
    };
  }

  /**
   * Mark message as seen/unseen
   */
  async markAsSeen(uid: number, seen: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.addFlags(uid, seen ? '\\Seen' : '', (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Mark message as flagged/unflagged
   */
  async setFlag(uid: number, flag: string, set: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      const operation = set ? this.imap.addFlags : this.imap.delFlags;
      
      operation.call(this.imap, uid, flag, (err: Error) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Move message to another folder
   */
  async moveMessage(uid: number, destinationBox: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.move(uid, destinationBox, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Delete message (move to trash or expunge)
   */
  async deleteMessage(uid: number, expunge: boolean = false): Promise<void> {
    await this.setFlag(uid, '\\Deleted', true);

    if (expunge) {
      return new Promise((resolve, reject) => {
        this.imap.expunge((err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    }
  }

  /**
   * Get mailbox status
   */
  async getMailboxStatus(boxName: string = 'INBOX'): Promise<{
    total: number;
    unseen: number;
    uidnext: number;
  }> {
    const box = await this.openBox(boxName, true);

    return {
      total: box.messages.total,
      unseen: box.messages.new,
      uidnext: box.uidnext,
    };
  }
}

// ============================================================================
// Auto-detect IMAP Settings
// ============================================================================

export function getImapSettings(emailDomain: string): {
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
} | null {
  const domain = emailDomain.toLowerCase();

  // Common provider settings
  const providers: Record<string, any> = {
    'gmail.com': {
      imapHost: 'imap.gmail.com',
      imapPort: 993,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
    },
    'yahoo.com': {
      imapHost: 'imap.mail.yahoo.com',
      imapPort: 993,
      smtpHost: 'smtp.mail.yahoo.com',
      smtpPort: 587,
    },
    'outlook.com': {
      imapHost: 'outlook.office365.com',
      imapPort: 993,
      smtpHost: 'smtp.office365.com',
      smtpPort: 587,
    },
    'hotmail.com': {
      imapHost: 'outlook.office365.com',
      imapPort: 993,
      smtpHost: 'smtp.office365.com',
      smtpPort: 587,
    },
    'aol.com': {
      imapHost: 'imap.aol.com',
      imapPort: 993,
      smtpHost: 'smtp.aol.com',
      smtpPort: 587,
    },
    'icloud.com': {
      imapHost: 'imap.mail.me.com',
      imapPort: 993,
      smtpHost: 'smtp.mail.me.com',
      smtpPort: 587,
    },
  };

  // Check exact match
  if (providers[domain]) {
    return providers[domain];
  }

  // Try common patterns
  return {
    imapHost: `imap.${domain}`,
    imapPort: 993,
    smtpHost: `smtp.${domain}`,
    smtpPort: 587,
  };
}





