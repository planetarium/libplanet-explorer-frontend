import { Scalars } from '../generated/graphql';
import React from 'react';

interface TimestampProps {
  timestamp: Scalars['DateTimeOffset'];
}

const formatOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  year: '2-digit',
  month: 'numeric',
  day: 'numeric',
};

const Timestamp: React.FC<TimestampProps> = ({ timestamp }) => {
  const date = new Date(timestamp);
  const now = new Date();
  if (
    now.getFullYear() == date.getFullYear() &&
    now.getMonth() == date.getMonth() &&
    now.getDate() == date.getDate()
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { year, month, day, ...timeStyle } = formatOptions;
    return (
      <time dateTime={date.toISOString()} title={date.toLocaleString()}>
        {date.toLocaleString(undefined, timeStyle)}
      </time>
    );
  }
  return (
    <time dateTime={date.toISOString()} title={date.toLocaleString()}>
      {date.toLocaleString(undefined, formatOptions)}
    </time>
  );
};

export default Timestamp;
