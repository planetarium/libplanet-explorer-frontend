import useSearchParams from 'lib/useSearchParams';

export const limit = 50;
export default function useOffset(asPath: string, keyName = 'offset') {
  const [searchParams, setSearchParams] = useSearchParams(asPath);
  const offset =
    keyName in searchParams
      ? typeof searchParams[keyName] === 'string'
        ? parseInt(searchParams[keyName] as string)
        : Array.isArray(searchParams[keyName])
        ? (searchParams[keyName] as string[])[-1]
        : 0
      : 0;
  const setOffset = (offset: number) => {
    if (offset < 1) {
      delete searchParams[keyName];
      setSearchParams(searchParams);
    } else {
      searchParams[keyName] = offset.toString();
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
