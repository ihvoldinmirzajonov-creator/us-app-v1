import { httpsCallable } from "firebase/functions";
import { functions } from "./client";

export const sendInvite = async (inviteEmail:string) => {
  const fn = httpsCallable(functions, 'sendInvite');
  const res = await fn({ inviteEmail });
  return res.data; // { inviteId }
}

export const createCouple = async (inviteId:string) => {
  const fn = httpsCallable(functions, 'createCouple');
  const res = await fn({ inviteId });
  return res.data;
}
