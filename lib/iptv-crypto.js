import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ENCRYPTED_FIELDS = [
  'm3u_link',
  'xtream_url',
  'xtream_username',
  'xtream_password',
];

function getEncryptionKey() {
  const key = process.env.IPTV_ENCRYPTION_KEY;

  if (!key || !/^[\da-f]{64}$/i.test(key)) {
    throw new Error(
      'IPTV_ENCRYPTION_KEY must be configured as 64 hexadecimal characters.',
    );
  }

  return Buffer.from(key, 'hex');
}

function getAssociatedData(macAddress, field) {
  return Buffer.from(`${macAddress}\0${field}`, 'utf8');
}

function toByteaHex(value) {
  return `\\x${value.toString('hex')}`;
}

function fromByteaHex(value) {
  if (typeof value !== 'string' || !value.startsWith('\\x')) {
    throw new Error('Stored IPTV value is not a valid BYTEA hex value.');
  }

  const hex = value.slice(2);
  if (hex.length % 2 !== 0 || !/^[\da-f]*$/i.test(hex)) {
    throw new Error('Stored IPTV value contains invalid BYTEA data.');
  }

  return Buffer.from(hex, 'hex');
}

export function encryptIptvFields(record) {
  const key = getEncryptionKey();

  return Object.fromEntries(
    ENCRYPTED_FIELDS.map((field) => {
      const value = record[field];

      if (value === null || value === undefined) {
        return [field, null];
      }

      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      cipher.setAAD(getAssociatedData(record.mac_address, field));

      const ciphertext = Buffer.concat([
        cipher.update(value, 'utf8'),
        cipher.final(),
      ]);
      const tag = cipher.getAuthTag();

      return [field, toByteaHex(Buffer.concat([iv, tag, ciphertext]))];
    }),
  );
}

export function decryptIptvFields(record) {
  const key = getEncryptionKey();

  return {
    ...record,
    ...Object.fromEntries(
      ENCRYPTED_FIELDS.map((field) => {
        const value = record[field];

        if (value === null || value === undefined) {
          return [field, null];
        }

        const encrypted = fromByteaHex(value);
        if (encrypted.length < 28) {
          throw new Error(`Stored IPTV field "${field}" is too short.`);
        }

        const iv = encrypted.subarray(0, 12);
        const tag = encrypted.subarray(12, 28);
        const ciphertext = encrypted.subarray(28);
        const decipher = createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAAD(getAssociatedData(record.mac_address, field));
        decipher.setAuthTag(tag);

        const plaintext = Buffer.concat([
          decipher.update(ciphertext),
          decipher.final(),
        ]).toString('utf8');

        return [field, plaintext];
      }),
    ),
  };
}
