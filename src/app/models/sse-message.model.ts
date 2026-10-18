export interface SseMessage {
  id?: number;
  type: string;
  message: string;
  value?: number;
  timestamp: string;
}

export interface ProductUpdate {
  productId: number;
  name: string;
  price: number;
  discount?: number;
  timestamp: string;
}
