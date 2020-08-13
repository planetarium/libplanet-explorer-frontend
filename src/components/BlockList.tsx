import React from 'react';
import { navigate } from 'gatsby';
import {
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
} from '@fluentui/react/lib/DetailsList';
import { ShimmeredDetailsList } from '@fluentui/react/lib/ShimmeredDetailsList';
import { Block } from '../generated/graphql';

interface BlockListProps {
  blocks: Block[] | null;
  loading: boolean;
  columns: IColumn[];
}

const POLL_INTERVAL = 2000;

const BlockList: React.FC<BlockListProps> = ({ blocks, loading, columns }) => (
  <ShimmeredDetailsList
    setKey="set"
    items={blocks === null || loading ? [] : blocks}
    columns={columns}
    selectionMode={SelectionMode.none}
    layoutMode={DetailsListLayoutMode.justified}
    isHeaderVisible={true}
    enableShimmer={loading}
    onItemInvoked={block => navigate(`/search/?${block.hash}`)}
  />
);

export default BlockList;
