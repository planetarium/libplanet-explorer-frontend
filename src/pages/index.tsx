import React from 'react';
import Wrapper from '../components/Wrapper';

const GRAPHQL_ENDPOINTS = JSON.parse(process.env.GRAPHQL_ENDPOINTS);

const IndexPage: React.FC<IndexPageProps> = ({ location }) => {
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
};
export default IndexPage;
