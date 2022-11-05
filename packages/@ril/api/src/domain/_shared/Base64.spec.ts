import { Base64, Base64InvalidError } from './Base64';

describe('Base64', () => {
  it('can construct', () => {
    const str =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAPUlEQVR4nGPY18KQoMOQasC3q4GBIdeaIVFfrcHbKtGUgaHUyej/p7tX1y8ssmdg0GRg2NjabMTAWuzKAACg5RADO0S3DwAAAABJRU5ErkJggg==';
    const base64 = new Base64(str);
    expect(base64.value).toBe(str);
  });

  it('throws an error for malformed', () => {
    expect(new Base64('123123')).toThrow(Base64InvalidError);
  });
});
