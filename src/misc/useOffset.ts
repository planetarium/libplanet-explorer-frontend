import useSearchParams from './useSearchParams';

export const limit = 50;
export default function useOffset(location: Location, keyName = 'offset') {
  const [searchParams, setSearchParams] = useSearchParams(location);
  const offset = keyName in searchParams ? parseInt(searchParams[keyName]) : 0;
  const setOffset = (offset: number) => {
    if (offset < 1) {
      delete searchParams[keyName];
      setSearchParams(searchParams);
    } else {
      searchParams[keyName] = offset;
      setSearchParams(searchParams);
    }
  };
  const olderHandler = () => {
    setOffset(+offset + limit);
  };
  const newerHandler = () => {
    setOffset(+offset - limit);
  };
  return [offset, olderHandler, newerHandler] as const;
}
