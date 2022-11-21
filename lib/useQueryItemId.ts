import { useMemo } from 'react';
import { useRouter } from 'next/router';

import useSearchParams from 'lib/useSearchParams';

export default function useQueryItemId() {
  const { isReady } = useRouter();
  const [query] = useSearchParams();
  return useMemo(
    () =>
      isReady
        ? query
          ? Object.keys(query).reduce(
              (d: string | null, k) => (query[k] ? d : d ? d : k),
              null
            )
          : null
        : undefined,
    [isReady, query]
  );
}
