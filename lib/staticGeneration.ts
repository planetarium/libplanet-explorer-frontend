import { GetStaticPathsResult, GetStaticPropsContext } from 'next';
import {
  GraphQLEndPoint,
  getEndpointFromQuery,
  GRAPHQL_ENDPOINTS,
} from 'lib/graphQLEndPoint';

export async function getCommonStaticProps(
  ctx: GetStaticPropsContext
): Promise<{ props: CommonPageProps }> {
  return {
    props: { staticEndpoint: getEndpointFromQuery(ctx.params) },
  };
}

export async function getCommonStaticPaths(): Promise<GetStaticPathsResult> {
  return {
    paths: GRAPHQL_ENDPOINTS.map(endpoint => ({
      params: { endpoint: endpoint.name },
    })),
    fallback: false,
  };
}

export interface CommonPageProps {
  staticEndpoint: GraphQLEndPoint | null;
}
