const fs = require('fs');
const path = require('path');
const GRAPHQL_ENDPOINTS = JSON.parse(process.env.GRAPHQL_ENDPOINTS);

function readdirAsync(path) {
  return new Promise(function (resolve, reject) {
    fs.readdir(path, function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const files = await readdirAsync('src/subpages');
  const remap = {
    'list.tsx': '',
  };

  GRAPHQL_ENDPOINTS.forEach(endpoint => {
    files.forEach(file => {
      const subPath = file in remap ? remap[file] : path.parse(file).name;
      const pagePath =
        subPath === '' ? `${endpoint.name}/` : `${endpoint.name}/${subPath}/`;

      createPage({
        path: pagePath,
        component: path.resolve(`src/subpages/${file}`),
        isPermanent: true,
        context: {
          endpoint,
        },
      });
    });
  });
};
