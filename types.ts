
export enum PersonaType {
  SISTER = 'SISTER',
  BROTHER = 'BROTHER'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Helpline {
  name: string;
  number: string;
  description: string;
}
