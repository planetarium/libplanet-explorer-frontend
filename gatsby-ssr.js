const React = require('react');

exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    React.createElement('link', {
      rel: 'stylesheet',
      href:
        'https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/10.0.0/css/fabric.min.css',
    }),
  ]);
};
