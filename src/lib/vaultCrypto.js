// Cifrado de extremo a extremo para la Bóveda Privada.
//
// PRINCIPIO CLAVE: la clave de cifrado se deriva EN EL NAVEGADOR a partir
// de la frase maestra del usuario (distinta de su contraseña de Google).
// Ni la frase maestra ni la clave derivada salen nunca de este dispositivo
// ni se envían al servidor — solo el contenido ya cifrado (ciphertext) y
// la sal (salt, que no es secreta) se guardan en la base de datos.
//
// Esto significa que si el usuario olvida su frase maestra, el contenido
// de la bóveda es irrecuperable — ni siquiera por el propio equipo de El
// Cénit. Es la contrapartida necesaria de un cifrado real "zero-knowledge".

const PBKDF2_ITERATIONS = 250000; // recomendación OWASP 2023+ para PBKDF2-SHA256

function toBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(base64) {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
}

export function generateSaltBase64() {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return toBase64(salt);
}

// Deriva una clave AES-256-GCM a partir de la frase maestra + sal.
// La clave resultante no es exportable (extractable: false) — solo puede
// usarse para cifrar/descifrar en esta misma sesión del navegador.
export async function deriveKey(passphrase, saltBase64) {
  const encoder = new TextEncoder();
  const salt = fromBase64(saltBase64);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptText(key, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext)
  );
  return { ciphertext: toBase64(ciphertext), iv: toBase64(iv) };
}

// Si la frase maestra es incorrecta, AES-GCM lanza una excepción al
// descifrar (el "tag" de autenticación no coincide) — así detectamos
// una frase equivocada sin tener que guardar la frase en ningún sitio.
export async function decryptText(key, ciphertextBase64, ivBase64) {
  const iv = new Uint8Array(fromBase64(ivBase64));
  const ciphertext = fromBase64(ciphertextBase64);
  const plaintextBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(plaintextBuffer);
}

export const VAULT_CHECK_PHRASE = "CENIT_VAULT_CHECK_OK";
