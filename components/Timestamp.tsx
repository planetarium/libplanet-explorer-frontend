import { Scalars } from 'src/gql/graphql';
import React from 'react';

const formatOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  year: '2-digit',
  month: 'numeric',
  day: 'numeric',
};

export default function Timestamp({
  timestamp,
}: {
  timestamp: Scalars['DateTimeOffset'];
}) {
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
}
