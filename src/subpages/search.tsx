import React from 'react';
import BlockHashResult from './block';
import TxIdResult from './transaction';

interface SearchPageProps {
  location: Location;
}

const SearchPage: React.FC<SearchPageProps> = ({ location }) => (
  <>
    <h1>Results</h1>
    <BlockHashResult location={location} />
    <TxIdResult location={location} />
  </>
);

export default SearchPage;
