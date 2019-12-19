import { Scalars } from '../generated/graphql';
import React from 'react';

interface TimestampProps {
  timestamp: Scalars['DateTimeOffset'];
}
const Timestamp: React.FC<TimestampProps> = ({ timestamp }) => {
  const date = new Date(timestamp);
  const formatOptions: any = {
    dateStyle: 'short',
    timeStyle: 'short',
  };
  const now = new Date();
  let string = date.toLocaleString(undefined, formatOptions);
  if (
    now.getFullYear() == date.getFullYear() &&
    now.getMonth() == date.getMonth() &&
    now.getDate() == date.getDate()
  ) {
    string = date.toLocaleTimeString(undefined, formatOptions);
  }
  return (
    <time dateTime={date.toISOString()} title={date.toLocaleString()}>
      {string}
    </time>
  );
};

export default Timestamp;
