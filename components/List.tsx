import { useRouter } from 'next/router';
import {
  DetailsListLayoutMode,
  IColumn,
  SelectionMode,
  ShimmeredDetailsList,
} from '@fluentui/react';
import { Block, Transaction, TransactionCommonFragment } from 'src/gql/graphql';
import { GraphQLEndPoint } from 'lib/graphQLEndPoint';

interface ListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[] | null;
  loading: boolean;
  columns: IColumn[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onItemInvoked: (item: any) => void;
  notFoundMessage?: string;
}

function List({
  items,
  loading,
  columns,
  onItemInvoked,
  notFoundMessage,
}: ListProps) {
  if (!loading && notFoundMessage && items?.length === 0)
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
}

export default List;

export type OmitListProps = Omit<ListProps, 'onItemInvoked' | 'items'>;

interface BlockListProps extends OmitListProps {
  blocks: Block[] | null;
  endpoint: GraphQLEndPoint;
}

export function BlockList({ blocks, endpoint, ...props }: BlockListProps) {
  const { push } = useRouter();
  return (
    <List
      items={blocks}
      {...props}
      onItemInvoked={(block: Block) =>
        push(`/${endpoint.name}/block/?${block.hash}`)
      }
    />
  );
}

interface TransactionListProps
  extends Omit<OmitListProps, 'columns' | 'items'> {
  transactions: TransactionCommonFragment[] | null;
  endpoint: GraphQLEndPoint;
  columns: IColumn[];
}

export function TransactionList({
  transactions,
  endpoint,
  columns,
  ...props
}: TransactionListProps) {
  const { push } = useRouter();
  return (
    <List
      items={transactions}
      {...props}
      columns={columns}
      onItemInvoked={(transaction: Transaction) =>
        push(`/${endpoint.name}/transaction/?${transaction.id}`)
      }
    />
  );
}
