import React, { useState } from 'react';
import { navigate } from 'gatsby';

import { Checkbox, IColumn } from '@fluentui/react';

import { Block, BlockListComponent } from '../generated/graphql';

import useOffset, { limit } from '../misc/useOffset';
import { mineColumns, commonProps } from '../misc/columns';

import List, { BlockListProps } from '../components/List';
import OffsetSwitch from '../components/OffsetSwitch';

import { IndexPageProps } from '../pages/index';

type ListPageProps = IndexPageProps;

const ListPage: React.FC<ListPageProps> = ({ location }) => {
  const [offset, olderHandler, newerHandler] = useOffset(location);
  const [excludeEmptyTxs, setExcludeEmptyTxs] = useState(false);
  return (
    <main>
      <Checkbox
        label="Include blocks having any tx"
        checked={excludeEmptyTxs}
        onChange={() => setExcludeEmptyTxs(!excludeEmptyTxs)}
      />
      <BlockListComponent variables={{ offset, limit, excludeEmptyTxs }}>
        {({ data, loading, error }) => {
          if (error) {
            console.error(error);
            return <p>{error.message}</p>;
          }
          const blocks =
            data && data.blockQuery && data.blockQuery.blocks
              ? (data.blockQuery.blocks as Block[])
              : null;

          return (
            <>
              <SummaryCards blocks={blocks} />
              <OffsetSwitch
                olderHandler={olderHandler}
                newerHandler={newerHandler}
                disable={{ older: loading, newer: loading || offset < 1 }}
              />
              <BlockList
                blocks={blocks}
                loading={loading}
                columns={mineColumns}
              />
            </>
          );
        }}
      </BlockListComponent>
    </main>
  );
};

export default ListPage;

export interface SummaryCardsProps {
  blocks: Block[] | null;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ blocks }) => {
  if (blocks === null)
    return <Cards interval={0} difficultyAverage={0} totalTxNumber={0} />;

  const timestamps: Date[] = blocks.map(block => new Date(block.timestamp));

  let interval = 0;
  for (let i = 0; i < timestamps.length - 1; i++) {
    interval += +timestamps[i] - +timestamps[i + 1];
  }
  interval /= (timestamps.length - 1) * 1000;

  const difficulties = blocks.map(block => block.difficulty);
  const difficultyAverage =
    difficulties.reduce((d, sum) => d + sum, 0) / difficulties.length;

  const txNumbers = blocks.map(block => block!.transactions.length);
  const totalTxNumber = txNumbers.reduce((a, b) => a + b, 0);
  return (
    <Cards
      interval={interval}
      difficultyAverage={difficultyAverage}
      totalTxNumber={totalTxNumber}
    />
  );
};

interface CardsProps {
  interval: number;
  difficultyAverage: number;
  totalTxNumber: number;
}

const Cards: React.FC<CardsProps> = ({
  interval,
  difficultyAverage,
  totalTxNumber,
}) => (
  <div className="cards">
    <div className="card" key="interval">
      <strong>{interval}</strong> sec
      <p>Average interval in this page</p>
    </div>
    <div className="card" key="difficultyAverage">
      <strong>{Math.floor(difficultyAverage).toLocaleString()}</strong>
      <p>Average difficulty in this page</p>
    </div>
    <div className="card" key="total-tx-number">
      <strong>{Math.floor(totalTxNumber).toLocaleString()}</strong>
      <p>Total txs in this page</p>
    </div>
  </div>
);

const BlockList: React.FC<BlockListProps> = ({ blocks, loading, columns }) => {
  const timeTaken: IColumn = {
    key: 'columnTimeTaken',
    name: 'Time Taken',
    minWidth: 50,
    maxWidth: 200,
    ...commonProps,
    isSortedDescending: true,
    data: 'string',
    isPadded: true,
    onRender: (block: Block, index) => {
      if (blocks === null) throw Error('blocks is null');
      if (index === undefined) throw Error('index is null');
      const beforeBlock = blocks[Math.min(index + 1, blocks.length - 1)];
      const beforeTimestamp = Date.parse(beforeBlock.timestamp);
      const nowTimestamp = Date.parse(block.timestamp);
      return <>{(nowTimestamp - beforeTimestamp) / 1000}</>;
    },
  };

  if (blocks !== null) columns.splice(4, 1, timeTaken);
  return (
    <List
      items={blocks}
      loading={loading}
      columns={columns}
      onItemInvoked={block => navigate(`/search/?${block.hash}`)}
    />
  );
};
