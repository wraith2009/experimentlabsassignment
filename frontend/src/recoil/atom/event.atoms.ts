import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const eventState = atom<[]>({
  key: "eventState",
  default: [],
  effects_UNSTABLE: [persistAtom],
});
