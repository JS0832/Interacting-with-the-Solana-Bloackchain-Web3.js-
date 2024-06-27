import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'probit-en/unknown (api/6.1.1)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Get the user's order history.
   *
   * @summary /order_history
   * @throws FetchError<4XX, types.OrderResponse4XX> 4XX
   */
  order(metadata: types.OrderMetadataParam): Promise<FetchResponse<200, types.OrderResponse200>> {
    return this.core.fetch('/order_history', 'get', metadata);
  }

  /**
   * /book
   *
   * @throws FetchError<400, types.BookResponse400> 400
   */
  book(): Promise<FetchResponse<200, types.BookResponse200>> {
    return this.core.fetch('/book', 'get');
  }

  /**
   * /new_order
   *
   * @throws FetchError<400, types.Order1Response400> 400
   * @throws FetchError<4XX, types.Order1Response4XX> 4XX
   */
  order1(body: types.Order1BodyParam): Promise<FetchResponse<200, types.Order1Response200>> {
    return this.core.fetch('/new_order', 'post', body);
  }

  /**
   * Get the user's all currency balance.
   *
   * @summary /balance
   * @throws FetchError<4XX, types.BalanceResponse4XX> 4XX
   */
  balance(): Promise<FetchResponse<200, types.BalanceResponse200>> {
    return this.core.fetch('/balance', 'get');
  }

  /**
   * Get the user's tradehistory.
   *
   * @summary /trade_history
   * @throws FetchError<4XX, types.TradeResponse4XX> 4XX
   */
  trade(metadata: types.TradeMetadataParam): Promise<FetchResponse<200, types.TradeResponse200>> {
    return this.core.fetch('/trade_history', 'get', metadata);
  }

  /**
   * /cancel_order
   *
   * @throws FetchError<400, types.Order2Response400> 400
   */
  order2(body: types.Order2BodyParam): Promise<FetchResponse<200, types.Order2Response200>> {
    return this.core.fetch('/cancel_order', 'post', body);
  }

  /**
   * Get the specific order's information.
   *
   * @summary /order
   * @throws FetchError<4XX, types.Order3Response4XX> 4XX
   */
  order3(metadata: types.Order3MetadataParam): Promise<FetchResponse<200, types.Order3Response200>> {
    return this.core.fetch('/order', 'get', metadata);
  }

  /**
   * /open_order
   *
   * @throws FetchError<400, types.OpenOrder1Response400> 400
   */
  open_order1(metadata: types.OpenOrder1MetadataParam): Promise<FetchResponse<200, types.OpenOrder1Response200>> {
    return this.core.fetch('/open_order', 'get', metadata);
  }

  /**
   * /withdrawal
   *
   * @throws FetchError<400, types.WithdrawalResponse400> 400
   */
  withdrawal(body: types.WithdrawalBodyParam): Promise<FetchResponse<200, types.WithdrawalResponse200>> {
    return this.core.fetch('/withdrawal', 'post', body);
  }

  /**
   * Get the user's deposit address
   *
   * @summary /deposit_address
   * @throws FetchError<400, types.DepositAddressResponse400> 400
   */
  deposit_address(metadata: types.DepositAddressMetadataParam): Promise<FetchResponse<200, types.DepositAddressResponse200>> {
    return this.core.fetch('/deposit_address', 'get', metadata);
  }

  /**
   * Get the user's deposit and withdrawal history
   *
   * @summary /transfer/payment
   * @throws FetchError<400, types.TransferpaymentResponse400> 400
   */
  transferpayment(metadata?: types.TransferpaymentMetadataParam): Promise<FetchResponse<200, types.TransferpaymentResponse200>> {
    return this.core.fetch('/transfer/payment', 'get', metadata);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { BalanceResponse200, BalanceResponse4XX, BookResponse200, BookResponse400, DepositAddressMetadataParam, DepositAddressResponse200, DepositAddressResponse400, OpenOrder1MetadataParam, OpenOrder1Response200, OpenOrder1Response400, Order1BodyParam, Order1Response200, Order1Response400, Order1Response4XX, Order2BodyParam, Order2Response200, Order2Response400, Order3MetadataParam, Order3Response200, Order3Response4XX, OrderMetadataParam, OrderResponse200, OrderResponse4XX, TradeMetadataParam, TradeResponse200, TradeResponse4XX, TransferpaymentMetadataParam, TransferpaymentResponse200, TransferpaymentResponse400, WithdrawalBodyParam, WithdrawalResponse200, WithdrawalResponse400 } from './types';
