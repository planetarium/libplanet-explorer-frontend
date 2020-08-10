import React, { useState } from 'react';
import { css } from 'emotion';
import { navigate } from 'gatsby';
import { Checkbox, DefaultButton, Link } from '@fluentui/react';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
} from '@fluentui/react/lib/DetailsList';
import { ShimmeredDetailsList } from '@fluentui/react/lib/ShimmeredDetailsList';
import { Block, BlockListComponent } from '../generated/graphql';
import useSearchParams from '../misc/useSearchParams';
import Timestamp from '../components/Timestamp';

import { IndexPageProps } from '../pages/index';

const POLL_INTERVAL = 2000;

const IndexPage: React.FC<IndexPageProps> = ({ location }) => {
  const limit = 21;
  const [searchParams, setSearchParams] = useSearchParams(location);
  const { offset = 0 } = searchParams;
  const setOffset = (offset: number) => {
    if (offset < 1) {
      const newSearchParams = { ...searchParams };
      delete newSearchParams.offset;
      setSearchParams(newSearchParams);
    } else {
      setSearchParams({ ...searchParams, offset });
    }
  };
  const olderHandler = () => {
    setOffset(+offset + limit);
  };
  const newerHandler = () => {
    setOffset(+offset - limit);
  };
  const [excludeEmptyTxs, setExcludeEmptyTxs] = useState(false);
  return (
    <div>
      <Checkbox
        label="Include blocks having any tx"
        checked={excludeEmptyTxs}
        onChange={(_, checked) => {
          setExcludeEmptyTxs(!!checked);
        }}
      />
      <BlockListComponent
        variables={{ offset, limit, excludeEmptyTxs }}
        pollInterval={POLL_INTERVAL}>
        {({ data, loading, error }) => {
          if (error) return <p>error!</p>;

          const timestamps: Date[] | null =
            data && data.blockQuery && data.blockQuery.blocks
              ? data.blockQuery.blocks.map(block => new Date(block!.timestamp))
              : null;

          let interval: number | null = timestamps ? 0 : null;
          if (interval != null && timestamps) {
            for (let i = 0; i < timestamps.length - 1; i++) {
              interval += +timestamps[i] - +timestamps[i + 1];
            }
            interval /= (timestamps.length - 1) * 1000;
          }

          const difficulties: number[] | null =
            data && data.blockQuery && data.blockQuery.blocks
              ? data.blockQuery.blocks.map(block => block!.difficulty)
              : null;
          let difficulty = 0;
          if (difficulties) {
            difficulty =
              difficulties.reduce((d, sum) => d + sum, 0) / difficulties.length;
          }

          const txNumbers: number[] | null =
            data && data.blockQuery && data.blockQuery.blocks
              ? data.blockQuery.blocks.map(block => block!.transactions.length)
              : null;
          let totalTxNumber = 0;
          if (txNumbers) {
            totalTxNumber = txNumbers.reduce((a, b) => a + b, 0);
          }
          return (
            <>
              <div className="cards">
                <div className="card" key="interval">
                  <strong>{interval}</strong> sec
                  <p>Average interval in this page</p>
                </div>
                <div className="card" key="difficulty">
                  <strong>{difficulty.toLocaleString()}</strong>
                  <p>Average difficulty in this page</p>
                </div>
                <div className="card" key="total-tx-number">
                  <strong>{Number(totalTxNumber).toLocaleString()}</strong>
                  <p>Total txs in this page</p>
                </div>
              </div>
              <div className="nav">
                <DefaultButton
                  onClick={newerHandler}
                  disabled={loading || offset < 1}
                  className={css`
                    margin-right: 5px;
                  `}>
                  &larr; Newer
                </DefaultButton>
                <DefaultButton disabled={loading} onClick={olderHandler}>
                  Older &rarr;
                </DefaultButton>
              </div>
              <BlockList
                blocks={
                  loading
                    ? []
                    : (data!.blockQuery!.blocks as NonNullable<Block[]>)
                }
                loading={loading}
              />
            </>
          );
        }}
      </BlockListComponent>
    </div>
  );
};

interface BlockListProps {
  blocks: Pick<Block, 'hash' | 'index' | 'timestamp' | 'difficulty'>[];
  loading: NonNullable<boolean>;
}

const BlockList: React.FC<BlockListProps> = ({ blocks, loading }) => {
  const columns: IColumn[] = [
    {
      key: 'columnIndex',
      name: 'Index',
      fieldName: 'index',
      iconName: 'NumberSymbol',
      isIconOnly: true,
      minWidth: 5,
      maxWidth: 40,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: true,
      data: 'string',
      isPadded: true,
      onRender: ({ index }) => <>{Number(index).toLocaleString()}</>,
    },
    {
      key: 'columnHash',
      name: 'Block Hash',
      fieldName: 'hash',
      minWidth: 5,
      maxWidth: 450,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      data: 'string',
      isPadded: true,
      onRender: ({ hash }) => <Link href={`./block/?${hash}`}>{hash}</Link>,
    },
    {
      key: 'columnTimestamp',
      name: 'Timestamp',
      fieldName: 'timestamp',
      minWidth: 100,
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
      key: 'coulmnMiner',
      name: 'Miner',
      fieldName: 'miner',
      minWidth: 123,
      maxWidth: 450,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: true,
      data: 'string',
      isPadded: true,
      onRender: ({ miner }) => (
        <Link href={`./account/?${miner}`}>{miner}</Link>
      ),
    },
    {
      key: 'columnTimeTaken',
      name: 'Time Taken',
      minWidth: 50,
      maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: true,
      data: 'string',
      isPadded: true,
      onRender: (block, index) => {
        let beforeBlock = blocks[Math.min(index! + 1, blocks.length - 1)];
        let beforeTimestamp = Date.parse(beforeBlock.timestamp);
        let nowTimestamp = Date.parse(block.timestamp);
        return <>{(nowTimestamp - beforeTimestamp) / 1000}</>;
      },
    },
    {
      key: 'columnDifficulty',
      name: 'Difficulty',
      minWidth: 50,
      maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: true,
      data: 'string',
      isPadded: true,
      onRender: ({ difficulty }) => (
        <>{parseInt(difficulty).toLocaleString()}</>
      ),
    },
    {
      key: 'columnTxNumber',
      name: 'Tx #',
      minWidth: 5,
      maxWidth: 20,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      data: 'number',
      isPadded: true,
      onRender: ({ transactions }) => <>{transactions.length}</>,
    },
  ];
  return (
    <ShimmeredDetailsList
      setKey="set"
      items={loading ? [] : blocks}
      columns={columns}
      selectionMode={SelectionMode.none}
      layoutMode={DetailsListLayoutMode.justified}
      isHeaderVisible={true}
      enableShimmer={loading}
      onItemInvoked={block => navigate(`/search/?${block.hash}`)}
    />
  );
};

export default IndexPage;
