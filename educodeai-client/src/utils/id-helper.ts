import Hashids from 'hashids';

const SALT = import.meta.env.HASHIDS_SALT; 
const MIN_LENGTH = 8; 

const hashids = new Hashids(SALT, MIN_LENGTH);

export const encodeId = (id: number): string => {
  return hashids.encode(id);
};

export const decodeId = (encodedId: string): number => {
  const decoded = hashids.decode(encodedId);
  return decoded.length > 0 ? Number(decoded[0]) : 0;
};