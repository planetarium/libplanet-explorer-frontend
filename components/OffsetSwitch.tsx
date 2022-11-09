import React from 'react';

import { css } from '@emotion/css';
import { DefaultButton } from '@fluentui/react';

interface OffsetSwitchProps {
  newerHandler?: () => void;
  olderHandler?: () => void;
  disable: { older: boolean; newer: boolean };
}

const OffsetSwitch: React.FC<OffsetSwitchProps> = ({
  newerHandler,
  olderHandler,
  disable,
}) => (
  <div className="nav">
    <DefaultButton
      onClick={newerHandler}
      disabled={disable.newer}
      className={css`
        margin-right: 5px;
      `}
    >
      &larr; Newer
    </DefaultButton>
    <DefaultButton disabled={disable.older} onClick={olderHandler}>
      Older &rarr;
    </DefaultButton>
  </div>
);

export default OffsetSwitch;
