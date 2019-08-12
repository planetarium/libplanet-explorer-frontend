import { useState, useEffect } from 'react';
import { navigate, withPrefix } from 'gatsby';

export default function useQueryString(location: Location) {
  const [queryString, setQueryString] = useState(location.search.substr(1));
  useEffect(() => {
    const path = location.pathname.substr(withPrefix('/').length - 1);
    navigate(path + (queryString ? `?${queryString}` : ''));
  }, [queryString]);
  return [queryString, setQueryString] as const;
}
