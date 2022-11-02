import React from 'react';
import Wrapper from 'components/Wrapper';

import { GRAPHQL_ENDPOINTS } from 'lib/graphQLEndPoint';

export default function Index() {
  return (
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
}
