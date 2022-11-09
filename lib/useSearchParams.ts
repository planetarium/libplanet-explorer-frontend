import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ParsedUrlQuery, parse } from 'querystring';

export default function useSearchParams(asPath: string) {
  const { push } = useRouter();
  const { pathname, query } = useMemo(() => {
    const delimiter = asPath.search('\\?');
    return delimiter >= 0
      ? {
          pathname: asPath.substring(0, delimiter),
          query: parse(asPath.substring(delimiter + 1)),
        }
      : { pathname: asPath, query: parse('') };
  }, [asPath]);
  const setSearchParams = useCallback(
    (query: ParsedUrlQuery) => {
      console.log(`\n\n\n\t\t${pathname}\n${query}\n\n\n`);
      push({ pathname, query });
    },
    [pathname, push]
  );
  return [query, setSearchParams] as const;
}
