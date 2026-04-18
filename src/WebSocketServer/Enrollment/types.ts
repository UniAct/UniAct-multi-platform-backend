export type ClientMeta = {
  subscribedSlotIds: Set<number>;
  isAlive: boolean;
  messageCount: number;
  lastMessageReset: number;
  userId?: number;
};

export interface SubscribeMessage {
  type: "subscribe";
  slotIds: number[];
}

export interface SeatUpdatePayload {
  slotId: number;
  remainingSeats: number;
}