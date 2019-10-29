import React from 'react';
import useQueryString from '../misc/useQueryString';
import { BlockByHashComponent } from '../generated/graphql';
import Wrapper from '../components/Wrapper';

interface BlockPageProps {
  location: Location;
}

const BlockPage: React.FC<BlockPageProps> = ({ location }) => {
  const [queryString, setQueryString] = useQueryString(location);
  const hash = queryString;
  return (
    <Wrapper>
      <h1>{`Block Details`}</h1>
      <p>Block Hash: <b>{queryString}</b></p>

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

          const minerLink = `/account/?${block.miner}`;

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

                <a href={minerLink}>
                  {block.miner}
                </a>
              </dd>
              <dt>Timestamp</dt>
              <dd>{block.timestamp}</dd>
              <dt>Previous hash</dt>
              <dd>
                {block.previousBlock ? <code>{block.previousBlock.hash}</code> : "N/A"}
              </dd>
              <dt>Difficulty</dt>
              <dd>{block.difficulty}</dd>
              <dt>Transactions</dt>
              <dd>
                <dl>
                  {
                    block.transactions.length > 0
                    ? block.transactions.map(
                      transaction => <>
                        <dt>Id</dt>
                        <dd>
                          <a href={`/transaction/?${transaction.id}`}>
                            <code>{transaction.id}</code>
                          </a>
                        </dd>
                        <dt>Timestamp</dt>
                        <dd>{transaction.timestamp}</dd>
                      </>
                    )
                    : <i>There is no transactions in this block</i>
                  }
                </dl>
              </dd>
            </dl>
          );
        }}
      </BlockByHashComponent>
    </Wrapper>
  );
};

export default BlockPage;
