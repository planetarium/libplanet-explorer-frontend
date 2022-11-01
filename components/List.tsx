import React from 'react';
import { navigate } from 'gatsby';
import {
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
} from '@fluentui/react/lib/DetailsList';
import { ShimmeredDetailsList } from '@fluentui/react/lib/ShimmeredDetailsList';
import {
  Block,
  Transaction,
  TransactionCommonFragment,
} from '../generated/graphql';

interface ListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[] | null;
  loading: boolean;
  columns: IColumn[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onItemInvoked: (item: any) => void;
  notFoundMessage?: string;
}

const List: React.FC<ListProps> = ({
  items,
  loading,
  columns,
  onItemInvoked,
  notFoundMessage,
}) => {
  if (!loading && notFoundMessage && items && items.length === 0)
    return <p>{notFoundMessage}</p>;
  return (
    <ShimmeredDetailsList
      setKey="set"
      items={items === null || loading ? [] : items}
      columns={columns}
      selectionMode={SelectionMode.none}
      layoutMode={DetailsListLayoutMode.justified}
      isHeaderVisible={true}
      enableShimmer={loading}
      onItemInvoked={onItemInvoked}
    />
  );
};

export default List;

export type OmitListProps = Omit<ListProps, 'onItemInvoked' | 'items'>;

interface BlockListProps extends OmitListProps {
  blocks: Block[] | null;
  endpointName: string;
}

export const BlockList: React.FC<BlockListProps> = ({
  blocks,
  endpointName,
  ...props
}) => (
  <List
    items={blocks}
    {...props}
    onItemInvoked={(block: Block) =>
      navigate(`/${endpointName}/block/?${block.hash}`)
    }
  />
);

interface TransactionListProps
  extends Omit<OmitListProps, 'columns' | 'items'> {
  transactions: TransactionCommonFragment[] | null;
  endpointName: string;
  columns: IColumn[];
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  endpointName,
  columns,
  ...props
}) => (
  <List
    items={transactions}
    {...props}
    columns={columns}
    onItemInvoked={(transaction: Transaction) =>
      navigate(`/${endpointName}/transaction/?${transaction.id}`)
    }
  />
);
