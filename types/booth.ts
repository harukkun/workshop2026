export interface Booth {
  id: number;
  name: string;
  subtitle: string;
  image: string;
  method: string;
  winCondition: string;
  conquestPoints: string;
  participants: string;
  coinCondition?: string;
  rules?: string;
  preparation?: string;
  postCheck?: string;
}
