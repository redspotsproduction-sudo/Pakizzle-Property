// WebAuthn / FIDO2 Passkey Client Utilities for Pakizzle Property

// Helper: Base64URL string to ArrayBuffer
export function base64urlToBuffer(base64url: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

// Helper: ArrayBuffer to Base64URL string
export function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Progressive check: Does this browser and device support platform biometric passkeys?
export async function isPasskeySupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!window.PublicKeyCredential) return false;

  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch {
    return false;
  }
}

export interface RegisteredPasskey {
  id: string;
  nickname: string;
  transports: string[];
  createdAt: string;
  lastUsedAt: string;
}

// 1. Register a new Passkey for the currently authenticated user
export async function registerPasskey(nickname?: string): Promise<{ success: boolean; passkey?: RegisteredPasskey; error?: string }> {
  try {
    const token = localStorage.getItem('pakizzle_token');
    const optionsRes = await fetch('/api/auth/passkey/register-options', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    if (!optionsRes.ok) {
      const err = await optionsRes.json();
      throw new Error(err.error || 'Failed to initialize passkey creation.');
    }

    const options = await optionsRes.json();

    // Convert Base64URL challenge and user ID to ArrayBuffer
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      ...options,
      challenge: base64urlToBuffer(options.challenge),
      user: {
        ...options.user,
        id: base64urlToBuffer(options.user.id),
      },
      excludeCredentials: (options.excludeCredentials || []).map((cred: any) => ({
        ...cred,
        id: base64urlToBuffer(cred.id),
      })),
    };

    // Trigger OS prompt (Touch ID, Face ID, Windows Hello)
    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential;

    if (!credential) {
      throw new Error('Passkey creation was cancelled by user.');
    }

    const rawResponse = credential.response as AuthenticatorAttestationResponse;
    const credentialPayload = {
      id: credential.id,
      rawId: bufferToBase64url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: bufferToBase64url(rawResponse.clientDataJSON),
        attestationObject: bufferToBase64url(rawResponse.attestationObject),
        transports: typeof rawResponse.getTransports === 'function' ? rawResponse.getTransports() : ['internal'],
      },
    };

    const verifyRes = await fetch('/api/auth/passkey/register-verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        credential: credentialPayload,
        nickname: nickname?.trim() || undefined,
      }),
    });

    if (!verifyRes.ok) {
      const err = await verifyRes.json();
      throw new Error(err.error || 'Failed to verify passkey with security server.');
    }

    const data = await verifyRes.json();
    return { success: true, passkey: data.passkey };
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Passkey setup was dismissed or timed out.' };
    }
    return { success: false, error: err.message || 'Passkey registration error.' };
  }
}

// 2. Sign In using Face ID / Touch ID Passkey
export async function authenticateWithPasskey(identifier?: string): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    const url = identifier 
      ? `/api/auth/passkey/login-options?identifier=${encodeURIComponent(identifier)}`
      : '/api/auth/passkey/login-options';

    const optionsRes = await fetch(url);
    if (!optionsRes.ok) {
      const err = await optionsRes.json();
      throw new Error(err.error || 'Failed to fetch passkey challenge.');
    }

    const options = await optionsRes.json();

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge: base64urlToBuffer(options.challenge),
      rpId: options.rpId,
      timeout: options.timeout || 60000,
      userVerification: options.userVerification || 'preferred',
      allowCredentials: options.allowCredentials?.map((cred: any) => ({
        ...cred,
        id: base64urlToBuffer(cred.id),
      })),
    };

    const assertion = (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential;

    if (!assertion) {
      throw new Error('Passkey sign-in was cancelled.');
    }

    const rawResponse = assertion.response as AuthenticatorAssertionResponse;
    const assertionPayload = {
      id: assertion.id,
      rawId: bufferToBase64url(assertion.rawId),
      type: assertion.type,
      response: {
        clientDataJSON: bufferToBase64url(rawResponse.clientDataJSON),
        authenticatorData: bufferToBase64url(rawResponse.authenticatorData),
        signature: bufferToBase64url(rawResponse.signature),
        userHandle: rawResponse.userHandle ? bufferToBase64url(rawResponse.userHandle) : null,
      },
    };

    const verifyRes = await fetch('/api/auth/passkey/login-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: assertionPayload }),
    });

    if (!verifyRes.ok) {
      const err = await verifyRes.json();
      throw new Error(err.error || 'Passkey validation failed.');
    }

    const data = await verifyRes.json();
    if (data.token) {
      localStorage.setItem('pakizzle_token', data.token);
    }

    return { success: true, token: data.token, user: data.user };
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Passkey verification was cancelled.' };
    }
    return { success: false, error: err.message || 'Passkey verification failed.' };
  }
}

// 3. Retrieve user's registered passkeys
export async function getRegisteredPasskeys(): Promise<RegisteredPasskey[]> {
  try {
    const token = localStorage.getItem('pakizzle_token');
    const res = await fetch('/api/auth/passkey/credentials', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.credentials || [];
  } catch {
    return [];
  }
}

// 4. Delete a registered passkey
export async function deletePasskey(id: string): Promise<boolean> {
  try {
    const token = localStorage.getItem('pakizzle_token');
    const res = await fetch(`/api/auth/passkey/credentials/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    return res.ok;
  } catch {
    return false;
  }
}
