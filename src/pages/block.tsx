import React from 'react';
import useQueryString from '../misc/useQueryString';
import { BlockByHashComponent } from '../generated/graphql';

interface BlockPageProps {
  location: Location;
}

const BlockPage: React.FC<BlockPageProps> = ({ location }) => {
  const [queryString, setQueryString] = useQueryString(location);
  const hash = queryString;
  return (
    <BlockByHashComponent variables={{ hash }}>
      {({ data, loading, error }) => {
        if (loading) return <p>loading&hellip;</p>;
        if (error) return <p>error!</p>;
        const { block } = data!;
        if (!block)
          return (
            <p>
              No such block: <code>{hash}</code>
            </p>
          );
        return (
          <dl>
            <dt>Index</dt>
            <dd>{block.index}</dd>
            <dt>Hash</dt>
            <dd>
              <code>{block.hash}</code>
            </dd>
            <dt>Nonce</dt>
            <dd>
              <code>{block.nonce}</code>
            </dd>
            <dt>Miner</dt>
            <dd>
              <code>{block.miner}</code>
            </dd>
            <dt>Timestamp</dt>
            <dd>{block.timestamp}</dd>
          </dl>
        );
      }}
    </BlockByHashComponent>
  );
};

export default BlockPage;
