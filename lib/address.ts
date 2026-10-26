const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function decodeBase58(value: string): Uint8Array | null {
  if (!value) return new Uint8Array();

  const bytes: number[] = [0];
  for (let index = 0; index < value.length; index += 1) {
    const code = ALPHABET.indexOf(value[index] ?? "");
    if (code === -1) return null;

    let carry = code;
    for (let byteIndex = 0; byteIndex < bytes.length; byteIndex += 1) {
      carry += (bytes[byteIndex] ?? 0) * 58;
      bytes[byteIndex] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  // The last leading "1" is already represented by the zero magnitude byte.
  for (let index = 0; index < value.length - 1 && value[index] === "1"; index += 1) {
    bytes.push(0);
  }

  const out = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1) {
    out[index] = bytes[bytes.length - 1 - index] ?? 0;
  }
  return out;
}

/** True when the string is a 32-byte base58 Solana address. Surrounding space is ignored. */
export function isSolanaAddress(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 32 || trimmed.length > 44) return false;
  const decoded = decodeBase58(trimmed);
  return decoded?.length === 32;
}

export function shortAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
