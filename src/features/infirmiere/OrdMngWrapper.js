import React, { useEffect } from 'react';
// import PropTypes from 'prop-types';
import { OrdMngPage } from '../home';

export default function OrdMngWrapper() {
  return (
    <div className="infirmiere-ord-mng-wrapper">
      <OrdMngPage />
    </div>
  );
}

OrdMngWrapper.propTypes = {};
OrdMngWrapper.defaultProps = {};
