import { ParsedUrlQuery, parse } from 'querystring';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';

export default function useSearchParams() {
  const { asPath, isReady, push } = useRouter();
  const { pathname, query } = useMemo(() => {
    if (!isReady) {
      return { pathname: undefined, query: undefined };
    }
    const delimiter = asPath.search('\\?');
    return delimiter >= 0
      ? {
          pathname: asPath.substring(0, delimiter),
          query: parse(asPath.substring(delimiter + 1)),
        }
      : { pathname: asPath, query: parse('') };
  }, [asPath, isReady]);
  const setSearchParams = useCallback(
    (query: ParsedUrlQuery) => {
      isReady && push({ pathname, query });
    },
    [isReady, pathname, push]
  );
  return [query, setSearchParams] as const;
}
