import type { TelemetryEvent } from "../types/index.js";

const MAX_SIZE = 900;

export class RingBuffer {
  private buffer: TelemetryEvent[] = [];
  private index = 0;
  private filled = false;

  push(event: TelemetryEvent): void {
    if (this.buffer.length < MAX_SIZE) {
      this.buffer.push(event);
    } else {
      this.buffer[this.index] = event;
      this.index = (this.index + 1) % MAX_SIZE;
      this.filled = true;
    }
  }

  getAll(): TelemetryEvent[] {
    if (!this.filled) {
      return [...this.buffer];
    }
    return [...this.buffer.slice(this.index), ...this.buffer.slice(0, this.index)];
  }

  getSince(sinceMs: number): TelemetryEvent[] {
    const cutoff = Date.now() - sinceMs;
    return this.getAll().filter((e) => new Date(e.timestamp).getTime() >= cutoff);
  }

  size(): number {
    return this.buffer.length;
  }
}

export const telemetryBuffer = new RingBuffer();
