import {
  Parameter$verifyYoutubeWebsub,
  RequestBody$notifyYoutubeWebsub,
} from '@neet/vschedule-api-client';
import { Response } from 'express';
import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  queryParam,
  requestBody,
  response,
} from 'inversify-express-utils';

import { CreateStream } from '../../../app/use-cases/CreateStream';
import { RemoveStream } from '../../../app/use-cases/RemoveStream';
import { ScheduleYoutubeWebsubResubscription } from '../../../app/use-cases/ScheduleYoutubeWebsubResubscription';
import { TYPES } from '../../../types';

@controller('/websub/youtube')
export class YoutubeWebsubController extends BaseHttpController {
  constructor(
    @inject(CreateStream)
    private readonly _createStream: CreateStream,

    @inject(RemoveStream)
    private readonly _removeStream: RemoveStream,

    @inject(ScheduleYoutubeWebsubResubscription)
    private readonly _scheduleYoutubeWebsubResubscription: ScheduleYoutubeWebsubResubscription,
  ) {
    super();
  }

  @httpGet('/')
  async verify(
    @response() res: Response,
    @queryParam() params: Parameter$verifyYoutubeWebsub,
  ) {
    // TODO: Unsubscribeのときのハンドリング
    await this._scheduleYoutubeWebsubResubscription.invoke({
      topic: params['hub.topic'],
      leaseSeconds: params['hub.lease_seconds'],
    });

    return res.send(params['hub.challenge']);
  }

  @httpPost('/', TYPES.YoutubeWebsubParser)
  async notify(
    @requestBody()
    body: RequestBody$notifyYoutubeWebsub['application/atom+xml'],
  ) {
    if (
      'at:deleted-entry' in body.feed &&
      body.feed['at:deleted-entry']?.[0]?.link?.[0]?.$?.href != null
    ) {
      const href = body.feed['at:deleted-entry'][0].link[0].$.href;
      if (href == null) {
        return this.statusCode(200);
      }

      await this._removeStream.invoke({ url: href });
      return this.statusCode(200);
    }

    if ('entry' in body.feed && body.feed.entry != null) {
      const videoId = body.feed.entry[0]?.['yt:videoId']?.[0];
      if (videoId == null) {
        return this.statusCode(200);
      }
      await this._createStream.invoke({ videoId });
      return this.statusCode(200);
    }

    return this.statusCode(200);
  }
}