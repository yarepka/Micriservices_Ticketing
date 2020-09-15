import nats, { Stan } from 'node-nats-streaming';

// Singletone class
class NatsWrapper {
  private _client?: Stan;

  // getter method
  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    // connecting to nats streaming server
    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('Connected to NATS');
        resolve();
      });

      // handling an error
      this.client.on('error', (err) => {
        reject(err);
      });
    });
  }
}

// importing one single instance, which will be shared between
// all of our files
export const natsWrapper = new NatsWrapper();