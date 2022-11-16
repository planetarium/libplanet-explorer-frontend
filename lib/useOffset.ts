import { useRouter } from 'next/router';

import useSearchParams from 'lib/useSearchParams';

export const limit = 50;
export default function useOffset(keyName = 'offset') {
  const { isReady } = useRouter();
  const [searchParams, setSearchParams] = useSearchParams();
  const offset =
    isReady && searchParams !== undefined
      ? keyName in searchParams
        ? typeof searchParams[keyName] === 'string'
          ? parseInt(searchParams[keyName] as string)
          : Array.isArray(searchParams[keyName])
          ? (searchParams[keyName] as string[])[-1]
          : 0
        : 0
      : undefined;
  const setOffset = (offset: number) => {
    if (isReady && searchParams !== undefined) {
      if (offset < 1) {
        delete searchParams[keyName];
        setSearchParams(searchParams);
      } else {
        searchParams[keyName] = offset.toString();
      }
      setSearchParams(searchParams);
    }
  };
  const olderHandler = () => {
    offset !== undefined && setOffset(+offset + limit);
  };
  const newerHandler = () => {
    offset !== undefined && setOffset(+offset - limit);
  };
  return [offset, olderHandler, newerHandler] as const;
}
