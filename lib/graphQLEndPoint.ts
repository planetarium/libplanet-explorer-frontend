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
