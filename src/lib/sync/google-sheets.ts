/**
 * Google Sheets Interoperability
 * Two-way sync with Google Sheets for secondary backup and reporting
 * Uses Token Bucket Algorithm for rate limiting
 */

export interface SyncConfig {
  sheetId: string;
  accessToken: string;
  refreshToken: string;
  rateLimit?: {
    tokens: number; // Initial tokens
    refillRate: number; // Tokens per second
    capacity: number; // Max tokens
  };
}

export interface SyncData {
  habits: Array<{
    id: string;
    title: string;
    date: string;
    completed: boolean;
    value?: number;
  }>;
  goals: Array<{
    id: string;
    title: string;
    progress: number;
  }>;
  xp: Array<{
    date: string;
    xp: number;
    category: string;
  }>;
}

/**
 * Token Bucket Algorithm for rate limiting
 */
class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number;

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  consume(tokens: number): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  private refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = elapsed * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  getWaitTime(tokens: number): number {
    this.refill();
    if (this.tokens >= tokens) {
      return 0;
    }
    const tokensNeeded = tokens - this.tokens;
    return Math.ceil(tokensNeeded / this.refillRate * 1000); // Return milliseconds
  }
}

/**
 * Google Sheets Sync Service
 */
export class GoogleSheetsSync {
  private config: SyncConfig;
  private tokenBucket: TokenBucket;

  constructor(config: SyncConfig) {
    this.config = config;
    const rateLimit = config.rateLimit || {
      tokens: 100,
      refillRate: 10,
      capacity: 100,
    };
    this.tokenBucket = new TokenBucket(rateLimit.capacity, rateLimit.refillRate);
  }

  /**
   * Sync data to Google Sheets
   */
  async syncToSheets(data: SyncData): Promise<void> {
    // Check rate limit
    if (!this.tokenBucket.consume(1)) {
      const waitTime = this.tokenBucket.getWaitTime(1);
      throw new Error(`Rate limit exceeded. Wait ${waitTime}ms`);
    }

    // Refresh access token if needed
    const accessToken = await this.refreshAccessTokenIfNeeded();

    // Prepare data for Google Sheets API
    const values = this.prepareSheetData(data);

    // Write to Google Sheets
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.config.sheetId}/values/A1:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to sync to Google Sheets: ${response.statusText}`);
    }
  }

  /**
   * Read data from Google Sheets
   */
  async readFromSheets(range: string): Promise<any[][]> {
    // Check rate limit
    if (!this.tokenBucket.consume(1)) {
      const waitTime = this.tokenBucket.getWaitTime(1);
      throw new Error(`Rate limit exceeded. Wait ${waitTime}ms`);
    }

    const accessToken = await this.refreshAccessTokenIfNeeded();

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.config.sheetId}/values/${range}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to read from Google Sheets: ${response.statusText}`);
    }

    const data = await response.json();
    return data.values || [];
  }

  /**
   * Prepare data for Google Sheets format
   */
  private prepareSheetData(data: SyncData): any[][] {
    const rows: any[][] = [];

    // Headers
    rows.push(['Date', 'Habit', 'Completed', 'Value', 'XP', 'Category']);

    // Habit data
    data.habits.forEach((habit) => {
      rows.push([
        habit.date,
        habit.title,
        habit.completed ? 'Yes' : 'No',
        habit.value || 0,
        '', // XP will be calculated
        '', // Category
      ]);
    });

    return rows;
  }

  /**
   * Refresh access token if needed
   */
  private async refreshAccessTokenIfNeeded(): Promise<string> {
    // In production, check token expiration and refresh if needed
    // For now, return the access token
    return this.config.accessToken;
  }
}

/**
 * Differential Sync: Only sync changes since last sync
 */
export async function differentialSync(
  syncService: GoogleSheetsSync,
  currentData: SyncData,
  lastSyncTime: Date
): Promise<void> {
  // Filter data to only include items modified since last sync
  const filteredData: SyncData = {
    habits: currentData.habits.filter((h) => {
      const habitDate = new Date(h.date);
      return habitDate >= lastSyncTime;
    }),
    goals: currentData.goals, // Always sync goals (they're less frequent)
    xp: currentData.xp.filter((x) => {
      const xpDate = new Date(x.date);
      return xpDate >= lastSyncTime;
    }),
  };

  await syncService.syncToSheets(filteredData);
}
