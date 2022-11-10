import { ParsedUrlQuery } from 'querystring';
import { useMemo } from 'react';

export default function useIdFromQuery(query: ParsedUrlQuery) {
  return useMemo(
    () =>
      query
        ? Object.keys(query).reduce(
            (d: string | null, k) => (query[k] ? d : d ? d : k),
            null
          )
        : null,
    [query]
  );
}
