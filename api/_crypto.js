import crypto from "node:crypto";

// Clave simétrica que SOLO vive en el servidor (variable de entorno de
// Vercel, sin prefijo VITE_, así que nunca llega al navegador). Debe ser
// una cadena base64 de 32 bytes — genera la tuya con:
//   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
function getKey() {
  const raw = process.env.HEREDEROS_ENC_KEY;
  if (!raw) {
    throw new Error("Falta la variable de entorno HEREDEROS_ENC_KEY en el servidor.");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("HEREDEROS_ENC_KEY debe decodificar a exactamente 32 bytes.");
  }
  return key;
}

// Cifra un objeto JS cualquiera (lo serializa a JSON primero).
// Devuelve { ciphertext, iv }, ambos en base64, listos para guardar.
export function encryptJSON(obj) {
  const key = getKey();
  const iv = crypto.randomBytes(12); // 96 bits, tamaño estándar para GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(obj), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    // Guardamos el "auth tag" pegado al final del ciphertext — es la
    // convención habitual, y así solo hace falta una columna.
    ciphertext: Buffer.concat([encrypted, authTag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

// Descifra lo que devuelve encryptJSON. Si la clave no coincide o el
// dato fue manipulado, lanza un error (gracias al auth tag de GCM) en
// vez de devolver datos corruptos silenciosamente.
export function decryptJSON(ciphertextB64, ivB64) {
  const key = getKey();
  const data = Buffer.from(ciphertextB64, "base64");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = data.subarray(data.length - 16);
  const encrypted = data.subarray(0, data.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8"));
}
