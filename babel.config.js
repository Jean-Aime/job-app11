module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Transform import.meta for web browser compatibility
          unstable_transformImportMeta: true,
        },
      ],
    ],
  };
};
