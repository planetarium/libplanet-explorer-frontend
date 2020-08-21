import React from 'react';
import { Link } from '@fluentui/react';
import { navigate } from 'gatsby';
import useQueryString from '../misc/useQueryString';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
} from '@fluentui/react/lib/DetailsList';
import { BlockByHashComponent, Transaction } from '../generated/graphql';
import Timestamp from '../components/Timestamp';

interface BlockPageProps {
  location: Location;
}

const BlockPage: React.FC<BlockPageProps> = ({ location }) => {
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
        const { block } = data!.blockQuery!;
        if (!block)
          return (
            <>
              <h2>Block Details</h2>
              <p>
                No such block: <code>{hash}</code>
              </p>
            </>
          );

        // FIXME: We'd better to use absolute paths and make Gatsby to
        // automatically rebase these absolute paths on the PATH_PREFIX
        // configuration.
        const minerLink = `../account/?${block.miner}`;
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
              <dt>Previous hash</dt>
              <dd>
                {block.previousBlock ? (
                  // FIXME: We'd better to use absolute paths and make Gatsby
                  // to automatically rebase these absolute paths on
                  // the PATH_PREFIX configuration.
                  <Link href={`./?${block.previousBlock.hash}`}>
                    <code>{block.previousBlock.hash}</code>
                  </Link>
                ) : (
                  'N/A'
                )}
              </dd>
              <dt>Difficulty</dt>
              <dd>{block.difficulty}</dd>
              <dt>Transactions</dt>
              {block.transactions.length > 0 ? (
                <TxList
                  txs={block.transactions as NonNullable<Transaction[]>}
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

interface TxListProps {
  txs: Pick<Transaction, 'id' | 'signer' | 'timestamp'>[];
}

const TxList: React.FC<TxListProps> = ({ txs }) => {
  const columns: IColumn[] = [
    {
      key: 'columnId',
      name: 'Id',
      fieldName: 'id',
      minWidth: 50,
      maxWidth: 300,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: true,
      data: 'string',
      isPadded: true,
      // FIXME: We'd better to use absolute paths and make Gatsby automatically
      // to rebase these absolute paths on the PATH_PREFIX configuration.
      onRender: ({ id }) => <Link href={`../transaction/?${id}`}>{id}</Link>,
    },
    {
      key: 'columnSigner',
      name: 'Signer',
      fieldName: 'signer',
      minWidth: 50,
      maxWidth: 250,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      data: 'string',
      isPadded: true,
      onRender: ({ signer }) => (
        // FIXME: We'd better to use absolute paths and make Gatsby to
        // automatically rebase these absolute paths on the PATH_PREFIX
        // configuration.
        <Link href={`../account/?${signer}`}>{signer}</Link>
      ),
    },
    {
      key: 'columnTimestamp',
      name: 'Timestamp',
      fieldName: 'timestamp',
      minWidth: 50,
      maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: true,
      data: 'string',
      isPadded: true,
      onRender: ({ timestamp }) => <Timestamp timestamp={timestamp} />,
    },
    {
      key: 'columnActionNumber',
      name: 'Action #',
      minWidth: 20,
      maxWidth: 40,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      data: 'number',
      isPadded: true,
      onRender: tx => <>{tx.actions ? tx.actions.length : '--'}</>,
    },
  ];
  return (
    <DetailsList
      items={txs}
      columns={columns}
      selectionMode={SelectionMode.none}
      getKey={tx => tx.id}
      setKey="set"
      layoutMode={DetailsListLayoutMode.justified}
      isHeaderVisible={true}
      // FIXME: We'd better to use absolute paths and make Gatsby automatically
      // to rebase these absolute paths on the PATH_PREFIX configuration.
      onItemInvoked={tx => navigate(`../transaction/?${tx.id}`)}
    />
  );
};

export default BlockPage;
