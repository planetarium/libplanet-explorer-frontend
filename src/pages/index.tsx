import React from 'react';
import Wrapper from '../components/Wrapper';

import { GRAPHQL_ENDPOINTS } from '../misc/graphQLEndPoint';

export interface IndexPageProps {
  location: Location;
}

const IndexPage: React.FC<IndexPageProps> = () => (
  <Wrapper>
    <h1>Endpoint list</h1>
    <ul>
      {GRAPHQL_ENDPOINTS.map(endpoint => (
        <li key={endpoint.name}>
          <a href={`/${endpoint.name}/`}>{endpoint.name}</a> /{' '}
          <small>{endpoint.uri}</small>
        </li>
      ))}
    </ul>
  </Wrapper>
);
export default IndexPage;
