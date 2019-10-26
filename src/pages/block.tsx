import React from 'react';
import { Link } from 'office-ui-fabric-react';
import { navigate } from 'gatsby';
import useQueryString from '../misc/useQueryString';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
} from 'office-ui-fabric-react/lib/DetailsList';
import { BlockByHashComponent, Transaction } from '../generated/graphql';

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
            <dt>Previous hash</dt>
            <dd>
              {block.previousBlock ? <code>{block.previousBlock.hash}</code> : "N/A"}
            </dd>
            <dt>Difficulty</dt>
            <dd>{block.difficulty}</dd>
            <dt>Transactions</dt>
            <TxList txs = {block.transactions as NonNullable<Transaction[]>}/>
          </dl>
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
      onRender: tx => (
        <Link href={`/transaction/?${tx.id}`}>{tx.id}</Link>
      ),
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
      isPadded: true
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
      onRender: tx => <>{tx.actions.length}</>,
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
      onItemInvoked={tx => navigate(`/transaction/?${tx.id}`)}
    />
  );
};

export default BlockPage;
