import { useState, useEffect } from 'react';
import { navigate } from 'gatsby';

export default function useQueryString(location: Location) {
  const [queryString, setQueryString] = useState(location.search.substr(1));
  useEffect(() => {
    navigate('.' + (queryString ? `?${queryString}` : ''));
  }, [queryString]);
  return [queryString, setQueryString] as const;
}
