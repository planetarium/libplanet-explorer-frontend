import React from 'react';
import { Link } from '@fluentui/react';
import useQueryString from '../misc/useQueryString';
import { BlockByHashComponent, Transaction } from '../generated/graphql';
import Timestamp from '../components/Timestamp';
import { listTxColumns } from '../misc/columns';

import { IndexPageProps } from '../pages/index';
import { TransactionList } from '../components/List';

type BlockPageProps = IndexPageProps;

const BlockPage: React.FC<BlockPageProps> = ({ location, ...props }) => {
  const [queryString] = useQueryString(location);
  const hash = queryString;
  return (
    <BlockByHashComponent variables={{ hash }}>
      {({ data, loading, error }) => {
        if (loading)
          return (
            <>
              <h2>Block Details</h2>
              <p>Loading&hellip;</p>
            </>
          );
        if (error)
          return (
            <>
              <h2>Block Details</h2>
              <p>
                Failed to load {hash} - {JSON.stringify(error.message)}
              </p>
            </>
          );
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { block } = data!.chainQuery.blockQuery!;
        if (!block)
          return (
            <>
              <h2>Block Details</h2>
              <p>
                No such block: <code>{hash}</code>
              </p>
            </>
          );

        const minerLink = `/${props.pageContext.endpoint.name}/account/?${block.miner}`;
        return (
          <>
            <h2>Block Details</h2>
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
                <Link href={minerLink}>
                  <code>{block.miner}</code>
                </Link>
              </dd>
              <dt>Timestamp</dt>
              <dd>
                <Timestamp timestamp={block.timestamp} />
              </dd>
              <dt>State Root Hash</dt>
              <dd>
                <code>{block.stateRootHash}</code>
              </dd>
              <dt>Previous hash</dt>
              <dd>
                {block.previousBlock ? (
                  <Link href={`/${props.pageContext.endpoint.name}/block/?${block.previousBlock.hash}`}>
                    <code>{block.previousBlock.hash}</code>
                  </Link>
                ) : (
                  'N/A'
                )}
              </dd>
              <dt>Difficulty</dt>
              <dd>{block.difficulty}</dd>
              <dt>Total Difficulty</dt>
              <dd>{block.totalDifficulty}</dd>
              <dt>Transactions</dt>
              {block.transactions.length > 0 ? (
                <TransactionList
                  transactions={block.transactions as NonNullable<Transaction[]>}
                  endpointName={props.pageContext.endpoint.name}
                  loading={loading}
                  columns={listTxColumns(props.pageContext.endpoint.name)}
                />
              ) : (
                <dd>
                  <i>There is no transactions in this block.</i>
                </dd>
              )}
            </dl>
          </>
        );
      }}
    </BlockByHashComponent>
  );
};

export default BlockPage;
