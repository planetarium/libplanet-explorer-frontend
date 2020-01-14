import React from 'react';
import useQueryString from '../misc/useQueryString';
import BlockHashResult from './block';
import TxIdResult from './transaction';

interface SearchPageProps {
  location: Location;
}

const SearchPage: React.FC<SearchPageProps> = ({ location }) => {
  const [queryString, setQueryString] = useQueryString(location);
  const hash = queryString;
  return (
    <>
      <h1>Results</h1>
      <BlockHashResult location={location} />
      <TxIdResult location={location} />
    </>
  );
};

export default SearchPage;
