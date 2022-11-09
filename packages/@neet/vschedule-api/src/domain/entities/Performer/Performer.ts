import { castDraft, produce } from 'immer';
import { Mixin } from 'ts-mixer';

import { Entity, Recipe, RehydrateParameters } from '../../_core';
import {
  ITimestamps,
  TimestampMixin,
  Timestamps,
} from '../../_shared/Timestamps';
import { Actor, ActorProps } from '../Actor';
import { BranchId } from '../Branch/BranchId';
import { OrganizationId } from '../Organization';
import { PerformerId } from './PerformerId';

export interface PerformerProps extends ActorProps {
  readonly id: PerformerId;
  readonly timestamps: Timestamps;
  readonly branchId: BranchId | null;
  readonly organizationId: OrganizationId | null;
}

type AutoGenerated = 'id' | 'timestamp';

const mixins = Mixin(
  Entity<PerformerId, PerformerProps>,
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
      branchId: props.branchId !== null ? new BranchId(props.branchId) : null,
      organizationId:
        props.organizationId !== null
          ? new OrganizationId(props.organizationId)
          : null,
    });
  }
}
