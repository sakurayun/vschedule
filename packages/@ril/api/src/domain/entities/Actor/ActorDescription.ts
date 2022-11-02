import validator from 'validator';

import { ValueObject } from '../../_core';

export class InvalidActorDescriptionError extends Error {}

export class ActorDescription extends ValueObject<string> {
  public constructor(value: string) {
    if (!validator.isLength(value, { min: 1, max: 5000 })) {
      throw new InvalidActorDescriptionError('Invalid actor description');
    }

    super(value);
  }

  public static from = ValueObject.createFactory(ActorDescription);
}
