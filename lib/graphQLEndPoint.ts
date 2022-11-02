import { ParsedUrlQuery } from 'querystring';

export interface GraphQLEndPoint {
  name: string;
  uri: string;
}

if (process.env.GRAPHQL_ENDPOINTS === undefined) {
  throw Error('GRAPHQL_ENDPOINTS environment variable is required');
}

export const GRAPHQL_ENDPOINTS = JSON.parse(
  process.env.GRAPHQL_ENDPOINTS
) as GraphQLEndPoint[];

export function getEndpointByName(name: string) {
  for (const endpoint of GRAPHQL_ENDPOINTS) {
    if (endpoint.name === name) {
      return endpoint;
    }
  }
  return null;
}

export function getEndpointFromQuery(query: ParsedUrlQuery | undefined) {
  return query?.endpoint
    ? Array.isArray(query?.endpoint)
      ? getEndpointByName(query?.endpoint[-1])
      : getEndpointByName(query?.endpoint)
    : null;
}

export const nullEndpoint = { name: '', uri: '' };
