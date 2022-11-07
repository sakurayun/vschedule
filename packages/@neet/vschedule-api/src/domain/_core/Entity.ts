import { immerable } from 'immer';

import { DeepPrimitiveOf } from './PrimitiveOf';
import { ValueObject, ValueOf } from './ValueObject';

export type Identifiable<T> = { readonly id: T };

export abstract class Entity<
  Id extends ValueObject = ValueObject,
  Props extends Identifiable<Id> = Identifiable<Id>,
> {
  public readonly [immerable] = true;

  public constructor(protected readonly _props: Props) {}

  public get id(): Id {
    return this._props.id;
  }

  public equals(that: typeof this): boolean {
    return this.id.equals(that.id);
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public toJSON(): DeepPrimitiveOf<Props> {
    return Object.entries(this._props as any).reduce((record, [key, value]) => {
      const _value = value as any;
      if (
        _value != null &&
        'toJSON' in _value &&
        typeof _value.toJSON === 'function'
      ) {
        (record as any)[key] = _value.toJSON();
      } else {
        (record as any)[key] = value;
      }
      return record;
    }, {} as DeepPrimitiveOf<Props>);
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export type PropsOf<T extends Entity> = T extends Entity<ValueObject, infer R>
  ? R
  : never;

/** 複数コンストラクタを持つVO */
export type RehydrateParameters<T> = {
  [key in keyof T]: ValueOf<T[key]> | T[key];
};