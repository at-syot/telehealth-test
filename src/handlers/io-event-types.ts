export type JoinRoomEventPayload = { roomId: number };
export type LeaveRoomEventPayload = JoinRoomEventPayload;
export type MsgEventPayload = {
  roomId: number;
  content: string;
};
export type BroadcastMsgEventPayload = MsgEventPayload & { senderId: number };
export type TeleChatEvents = {
  joinRoom: (payload: JoinRoomEventPayload, cb: any) => void;
  leaveRoom: (payload: LeaveRoomEventPayload) => void;
  message: (payload: MsgEventPayload) => void;
  broadcastMessage: (payload: BroadcastMsgEventPayload) => void;
};
export type TeleChatEventCallbacks<K extends keyof TeleChatEvents> =
  TeleChatEvents[K];
