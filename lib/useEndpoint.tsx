import { useMemo } from 'react';
import { useRouter } from 'next/router';

import { getEndpointFromQuery, GraphQLEndPoint } from 'lib/graphQLEndPoint';
import useSearchParams from 'lib/useSearchParams';

export default function useEndpoint(staticEndpoint: GraphQLEndPoint | null) {
  const { isReady } = useRouter();
  const [query] = useSearchParams();
  return useMemo(
    () => staticEndpoint ?? (isReady ? getEndpointFromQuery(query) : undefined),
    [isReady, query, staticEndpoint]
  );
}
