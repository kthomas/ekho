import { AxiosInstance, AxiosResponse } from 'axios';
import { KeyManager } from '../key-manager.interface';

export class VaultKeyManager implements KeyManager {
  constructor(private readonly client: AxiosInstance) {}

  async createSigningKey(id: number): Promise<void> {
    const payload = {
      type: 'ed25519',
      derived: false,
    };
    const response: AxiosResponse = await this.client.post(`/v1/users-signing-keys/keys/${id}`, payload);
    this.checkResponse(response, `Failed to create private signing keys for user ${id}`, 204);
  }

  async readPublicSigningKey(id: number): Promise<string> {
    const response: AxiosResponse = await this.client.get(`/v1/users-signing-keys/keys/${id}`);
    this.checkResponse(response, `Failed to create private signing keys for user ${id}`);
    return response.data.data.keys['1'].public_key;
  }

  async sign(id: number, data: string): Promise<string> {
    const payload = {
      input: Buffer.from(data).toString('base64'),
    };
    const response: AxiosResponse = await this.client.post(`/v1/users-signing-keys/sign/${id}`, payload);
    this.checkResponse(response, `Failed to create private signing keys for user ${id}`);
    const fullSignature: string = response.data.data.signature;
    const signature = fullSignature.split(':')[2];
    return signature;
  }

  private checkResponse(response: AxiosResponse, context: string, expectedStatus = 200) {
    if (!response) {
      throw Error(`${context}: no response`);
    }
    if (response.status !== expectedStatus) {
      throw Error(`${context}: server responded ${response.status}`);
    }
  }
}