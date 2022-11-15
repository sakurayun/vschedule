import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  queryParam,
  requestBody,
} from 'inversify-express-utils';

import {
  CreateOrganization,
  ListOrganization,
  ShowOrganization,
} from '../../../../app';
import { TYPES } from '../../../../types';
import { Methods } from '../../../generated/rest/v1/organizations';
import { RestPresenter } from '../../../mappers/rest-presenter';

@controller('/rest/v1/organizations')
export class OrganizationsController extends BaseHttpController {
  public constructor(
    @inject(ShowOrganization)
    private readonly _showOrganization: ShowOrganization,

    @inject(CreateOrganization)
    private readonly _createOrganization: CreateOrganization,

    @inject(ListOrganization)
    private readonly _listOrganization: ListOrganization,

    @inject(RestPresenter)
    private readonly _presenter: RestPresenter,
  ) {
    super();
  }

  @httpGet('/:organizationId')
  async show(@queryParam('organizationId') organizationId: string) {
    const organization = await this._showOrganization.invoke(organizationId);
    return this.json(this._presenter.presentOrganization(organization));
  }

  @httpGet('/')
  async list(@queryParam() query: Methods['get']['query'] = {}) {
    const organizations = await this._listOrganization.invoke({
      limit: query.limit,
      offset: query.offset,
    });

    return this.json(
      organizations.map((organization) =>
        this._presenter.presentOrganization(organization),
      ),
    );
  }

  @httpPost('/', TYPES.Authenticated)
  async create(@requestBody() body: Methods['post']['reqBody']) {
    const organization = await this._createOrganization.invoke({
      name: body.name,
      url: body.url ?? null,
      description: body.description ?? null,
      color: body.color ?? null,
      youtubeChannelId: body.youtubeChannelId ?? null,
      twitterUsername: body.twitterUsername ?? null,
    });

    return this.json(this._presenter.presentOrganization(organization));
  }
}
