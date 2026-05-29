import { ComponentOptions } from '../types';

export class Component {
  public customId: string;
  public type: 'button' | 'select' | 'modal';
  public execute: (interaction: any) => Promise<void>;

  constructor(options: ComponentOptions) {
    this.customId = options.customId;
    this.type = options.type;
    this.execute = options.execute;
  }
}
