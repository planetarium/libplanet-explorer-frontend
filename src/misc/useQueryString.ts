import { useCallback, useMemo } from 'react';
import { navigate, withPrefix } from 'gatsby';

export default function useQueryString(location: Location) {
  const queryString = useMemo(() => location.search.substr(1), [location]);
  const setQueryString = useCallback(
    (queryString: string) => {
      const path = location.pathname.substr(withPrefix('/').length - 1);
      navigate(path + (queryString ? `?${queryString}` : ''));
    },
    [location, navigate]
  );
  return [queryString, setQueryString] as const;
}
