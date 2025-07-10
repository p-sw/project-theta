export interface IOpenAPI {
  openapi: string;
  info: IInfo;
  jsonSchemaDialect?: string;
  servers?: IServer[];
  paths?: IPaths;
  webhooks?: Record<string, IPathItem>;
  components?: IComponents;
  security?: ISecurityRequirement[];
  tags?: ITag[];
  externalDocs?: IExternalDocs;
}

export interface IInfo {
  title: string;
  summary?: string;
  description?: string;
  termsOfService?: string;
  contact?: IContact;
  license?: ILicense;
  version: string;
}

export interface IContact {
  name?: string;
  url?: string;
  email?: string;
}

export interface ILicense {
  name: string;
  identifier?: string;
  url?: string;
}

export interface IServer {
  url: string;
  description?: string;
  variables?: Record<string, IServerVariable>;
}

export interface IServerVariable {
  enum?: string[];
  default: string;
  description?: string;
}

export interface IComponents {
  schemas?: Record<string, ISchema>;
  responses?: Record<string, IResponse | IReference>;
  parameters?: Record<string, IParameter | IReference>;
  examples?: Record<string, IExample | IReference>;
  requestBodies?: Record<string, IRequestBody | IReference>;
  headers?: Record<string, IHeader | IReference>;
  securitySchemes?: Record<string, ISecurityScheme | IReference>;
  links?: Record<string, ILink | IReference>;
  callbacks?: Record<string, ICallback | IReference>;
  pathItems?: Record<string, IPathItem>;
}

export interface IPaths {
  [key: `/${string}`]: IPathItem;
}

export interface IPathItem {
  $ref?: string;
  summary?: string;
  description?: string;
  get?: IOperation;
  put?: IOperation;
  post?: IOperation;
  delete?: IOperation;
  options?: IOperation;
  head?: IOperation;
  patch?: IOperation;
  trace?: IOperation;
  servers?: IServer[];
  parameters?: (IParameter | IReference)[];
}

export interface IOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: IExternalDocs;
  operationId?: string;
  parameters?: (IParameter | IReference)[];
  requestBody?: IRequestBody | IReference;
  responses?: IResponses;
  callbacks?: Record<string, ICallback | IReference>;
  deprecated?: boolean;
  security?: ISecurityRequirement[];
  servers?: IServer[];
}

export interface IExternalDocs {
  description?: string;
  url: string;
}

export type IParameter = _IParameterPath | _IParameterHeader | _IParameterOther;

interface _IParameter {
  description?: string;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
}

interface _IParameterPath extends _IParameter {
  name: string;
  in: 'path';
}

interface _IParameterHeader extends _IParameter {
  name: 'Accept' | 'Content-Type' | 'Authorization';
  in: 'header';
}

interface _IParameterOther extends _IParameter {
  name: string;
  in: 'query' | 'cookie';
}

export interface IRequestBody {
  description?: string;
  required?: boolean;
  content: Record<string, IMediaType>;
}

export interface IMediaType {
  schema?: ISchema;
  example?: any;
  examples?: Record<string, IExample | IReference>;
  encoding?: Record<string, IEncoding>;
}

export interface IEncoding {
  contentType?: string;
  headers?: Record<string, IHeader | IReference>;
}

export interface IResponses {
  default?: IResponse | IReference;
  [key: `${number}`]: IResponse | IReference;
}

export interface IResponse {
  description: string;
  headers?: Record<string, IHeader | IReference>;
  content?: Record<string, IMediaType>;
  links?: Record<string, ILink | IReference>;
}

export interface ICallback {
  [key: string]: IPathItem;
}

export interface IExample {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
}

export interface ILink {
  operationRef?: string;
  operationId?: string;
  parameters?: Record<string, any>;
  requestBody?: any;
  description?: string;
  server?: IServer;
}

export interface IHeader {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
}

export interface ITag {
  name: string;
  description?: string;
  externalDocs?: IExternalDocs;
}

export interface IReference {
  $ref: string;
  summary?: string;
  description?: string;
}

export interface ISchema {
  discriminator?: IDiscriminator;
  xml?: IXml;
  externalDocs?: IExternalDocs;
  example?: any;
}

export interface IDiscriminator {
  propertyName: string;
  mapping?: Record<string, string>;
}

export interface IXml {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

export type ISecurityScheme =
  | _ISecuritySchemeApiKey
  | _ISecuritySchemeHttp
  | _ISecuritySchemeHttpBearer
  | _ISecuritySchemeOAuth2
  | _ISecuritySchemeOpenIdConnect;

interface _ISecurityScheme {
  description?: string;
}

interface _ISecuritySchemeApiKey extends _ISecurityScheme {
  type: 'apiKey';
  name: string;
  in: 'query' | 'header' | 'cookie';
}

interface _ISecuritySchemeHttp extends _ISecurityScheme {
  type: 'http';
  scheme: 'basic' | 'bearer' | 'digest';
}

interface _ISecuritySchemeHttpBearer extends _ISecuritySchemeHttp {
  scheme: 'bearer';
  bearerFormat?: string;
}

interface _ISecuritySchemeOAuth2 extends _ISecurityScheme {
  type: 'oauth2';
  flows: IOAuth2Flows;
}

interface _ISecuritySchemeOpenIdConnect extends _ISecurityScheme {
  type: 'openIdConnect';
  openIdConnectUrl: string;
}

export interface IOAuth2Flows {
  implicit?: IOAuth2Flow;
  password?: IOAuth2Flow;
  clientCredentials?: IOAuth2Flow;
  authorizationCode?: IOAuth2Flow;
}

export interface IOAuth2Flow {
  authorizationUrl: string;
  tokenUrl: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface ISecurityRequirement {
  [key: string]: string[];
}
