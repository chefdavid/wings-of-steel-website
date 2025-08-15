module.exports = {
  onPreBuild: async ({ utils }) => {
    await utils.cache.remove('.cache');
    await utils.cache.remove('node_modules/.cache');
    console.log('Build cache cleared');
  },
};