const DataLoader = require('dataloader');
const Organization = require('../models/Organization');

const organizationLoader = new DataLoader(async (keys) => {
  const organizations = await Organization.find({ _id: { $in: keys } });
  return keys.map((key) => organizations.find((org) => org._id.toString() === key.toString()));
});

module.exports = organizationLoader;
