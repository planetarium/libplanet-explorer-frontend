import { Scalars } from '../generated/graphql';
import React from 'react';

interface TimestampProps {
  timestamp: Scalars['DateTimeOffset'];
}
const Timestamp: React.FC<TimestampProps> = ({ timestamp }) => {
  const date = new Date(timestamp);
  const formatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
  };
  const now = new Date();
  let string = date.toLocaleString(undefined, formatOptions);
  if (
    now.getFullYear() == date.getFullYear() &&
    now.getMonth() == date.getMonth() &&
    now.getDate() == date.getDate()
  ) {
    const { year, month, day, ...pickFormatOptions } = formatOptions;
    string = date.toLocaleString(undefined, pickFormatOptions);
  }
  return (
    <time dateTime={date.toISOString()} title={date.toLocaleString()}>
      {string}
    </time>
  );
};

export default Timestamp;
