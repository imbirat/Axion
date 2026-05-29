import { EventOptions } from '../types';

export class Event {
  public name: string;
  public once: boolean;
  public execute: (...args: unknown[]) => Promise<void> | void;

  constructor(options: EventOptions) {
    this.name = options.name;
    this.once = options.once ?? false;
    this.execute = options.execute;
  }
}
