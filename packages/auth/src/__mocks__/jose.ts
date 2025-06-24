export class SignJWT {
  private payload: any;
  private header: any = { alg: "HS256" };

  constructor(payload: any) {
    this.payload = payload;
  }

  setProtectedHeader(header: any) {
    this.header = { ...this.header, ...header };
    return this;
  }

  setIssuedAt() {
    this.payload.iat = Math.floor(Date.now() / 1000);
    return this;
  }

  setExpirationTime(exp: string | number) {
    if (typeof exp === "string") {
      const match = exp.match(/^(-?\d+)s$/);
      if (match) {
        const seconds = parseInt(match[1], 10);
        this.payload.exp = Math.floor(Date.now() / 1000) + seconds;
      }
    } else if (typeof exp === "number") {
      this.payload.exp = exp;
    }
    return this;
  }

  async sign(secret: Uint8Array): Promise<string> {
    // Mock JWT format: header.payload.signature
    const header = Buffer.from(JSON.stringify(this.header)).toString(
      "base64url",
    );
    const payload = Buffer.from(JSON.stringify(this.payload)).toString(
      "base64url",
    );
    // Include timestamp in signature to make each token unique
    const signature = `mock-signature-${Date.now()}`;
    return `${header}.${payload}.${signature}`;
  }
}

export async function jwtVerify(token: string, secret: Uint8Array) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());

  // Check expiration
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return { payload };
}
