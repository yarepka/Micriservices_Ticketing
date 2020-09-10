// Fake implementation of the natsWrapper for testing with Jest
export const natsWrapper = {
  client: {
    publish: jest.fn().mockImplementation((subject: string, data: string, callback: () => void) => {
      callback();
    })
  }
};