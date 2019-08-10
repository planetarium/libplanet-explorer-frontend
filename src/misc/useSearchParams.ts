import querystring from 'querystring';
import useQueryString from './useQueryString';

export default function useSearchParams(location: Location) {
  const [queryString, setQueryString] = useQueryString(location);
  const searchParams = querystring.parse(queryString);
  const setSearchParams = (searchParams: any) =>
    setQueryString(querystring.stringify(searchParams));
  return [searchParams, setSearchParams] as const;
}
