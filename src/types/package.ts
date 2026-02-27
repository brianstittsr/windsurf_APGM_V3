import { Timestamp } from 'firebase/firestore';

export interface ClientPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  services: string[];
  duration: number; // in minutes
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
