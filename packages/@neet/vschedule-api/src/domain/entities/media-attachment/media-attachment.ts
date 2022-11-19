import { Mixin } from 'ts-mixer';

import { AggregateRoot, Recipe } from '../../_core';
import { DataUri, ITimestamps, TimestampMixin, Timestamps } from '../_shared';
import { MediaAttachmentBucket } from './media-attachment-bucket';
import { MediaAttachmentFilename } from './media-attachment-filename';
import { MediaAttachmentId } from './media-attachment-id';
import { MediaAttachmentSize } from './media-attachment-size';

export interface MediaAttachmentProps {
  readonly id: MediaAttachmentId;
  readonly filename: MediaAttachmentFilename;
  readonly blurDataUri: DataUri;
  readonly width: MediaAttachmentSize;
  readonly height: MediaAttachmentSize;
  readonly bucket: MediaAttachmentBucket | null;
  readonly remoteUrl: URL | null;
  readonly timestamps: Timestamps;
}

type AutoGenerated = 'id' | 'timestamps';

const mixins = Mixin(
  AggregateRoot<MediaAttachmentId, MediaAttachmentProps>,
  TimestampMixin,
);

export class MediaAttachment extends mixins implements ITimestamps {
  public constructor(props: MediaAttachmentProps) {
    super(props);
  }

  get id(): MediaAttachmentId {
    return this._props.id;
  }

  get filename(): MediaAttachmentFilename {
    return this._props.filename;
  }

  get blurDataUri(): DataUri {
    return this._props.blurDataUri;
  }

  get width(): MediaAttachmentSize {
    return this._props.width;
  }

  get height(): MediaAttachmentSize {
    return this._props.height;
  }

  get bucket(): MediaAttachmentBucket | null {
    return this._props.bucket;
  }

  get remoteUrl(): URL | null {
    return this._props.remoteUrl;
  }

  get extension(): string | undefined {
    return this.filename.value.split('.').pop();
  }

  public static create(
    props: Omit<Recipe<MediaAttachmentProps>, AutoGenerated>,
  ) {
    return MediaAttachment.rehydrate({
      ...props,
      id: new MediaAttachmentId(),
      timestamps: new Timestamps(),
    });
  }

  public static rehydrate(
    props: Recipe<MediaAttachmentProps>,
  ): MediaAttachment {
    return new MediaAttachment({
      id: new MediaAttachmentId(props.id),
      blurDataUri: new DataUri(props.blurDataUri),
      width: new MediaAttachmentSize(props.width),
      height: new MediaAttachmentSize(props.height),
      filename: new MediaAttachmentFilename(props.filename),
      remoteUrl: props.remoteUrl,
      bucket:
        props.bucket !== null ? new MediaAttachmentBucket(props.bucket) : null,
      timestamps: props.timestamps,
    });
  }
}