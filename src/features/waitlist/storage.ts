export interface WaitlistStorage {
  add(email: string): Promise<void>;
  list(): Promise<string[]>;
}

class InMemoryWaitlistStorage implements WaitlistStorage {
  private readonly emails = new Map<string, true>();

  async add(email: string): Promise<void> {
    this.emails.set(email.toLowerCase(), true);
  }

  async list(): Promise<string[]> {
    return Array.from(this.emails.keys());
  }
}

export const waitlistStorage = new InMemoryWaitlistStorage();
