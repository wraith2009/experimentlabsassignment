import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  userId?: string;
}

export const eventState = atom<CalendarEvent[]>({
  key: "eventState",
  default: [],
  effects_UNSTABLE: [persistAtom],
});
