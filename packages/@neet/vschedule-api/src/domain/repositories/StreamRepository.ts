import { URL } from 'url';

import { Stream, StreamId } from '../entities';

export interface ListStreamsParams {
  readonly limit?: number;
  readonly offset?: number;
  readonly organizationId?: string;
}

export interface IStreamRepository {
  findById(id: StreamId): Promise<Stream | null>;
  findByUrl(url: URL): Promise<Stream | null>;

  list(params: ListStreamsParams): Promise<Stream[]>;

  save(stream: Stream): Promise<Stream>;
  update(stream: Stream): Promise<Stream>;
  remove(streamId: StreamId): Promise<void>;
}