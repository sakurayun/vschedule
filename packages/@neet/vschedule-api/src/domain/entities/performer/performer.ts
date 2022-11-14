import { castDraft, produce } from 'immer';
import { Mixin } from 'ts-mixer';

import { AggregateRoot, Recipe, RehydrateParameters } from '../../_core';
import {
  Actor,
  ActorProps,
  ITimestamps,
  TimestampMixin,
  Timestamps,
} from '../_shared';
import { OrganizationId } from '../organization';
import { PerformerId } from './performer-id';

export interface PerformerProps extends ActorProps {
  readonly id: PerformerId;
  readonly timestamps: Timestamps;
  readonly organizationId: OrganizationId | null;
}

type AutoGenerated = 'id' | 'timestamps';

const mixins = Mixin(
  AggregateRoot<PerformerId, PerformerProps>,
  Actor,
  TimestampMixin,
);

export class Performer extends mixins implements ITimestamps {
  public get organizationId(): OrganizationId | null {
    return this._props.organizationId;
  }

  public update(patch: Partial<RehydrateParameters<this>>) {
    const updated = produce(this._props, (draft) => {
      Object.entries(patch).forEach(([key, value]) => {
        if (value !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (draft as any)[key] = castDraft(value);
        }
      });
      draft.timestamps = draft.timestamps.update();
    });
    return Performer.rehydrate(updated);
  }

  public static create(props: Omit<Recipe<PerformerProps>, AutoGenerated>) {
    return Performer.rehydrate({
      // ...Actor.create(props),
      ...props,
      id: new PerformerId(),
      timestamps: new Timestamps(),
    });
  }

  public static rehydrate(props: Recipe<PerformerProps>) {
    return new Performer({
      ...Actor.rehydrate(props),
      id: new PerformerId(props.id),
      timestamps: props.timestamps,
      organizationId:
        props.organizationId !== null
          ? new OrganizationId(props.organizationId)
          : null,
    });
  }
}
