const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList, GraphQLNonNull } = require('graphql');

// Organization Type
const OrganizationType = new GraphQLObjectType({
  name: 'Organization',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args, { loaders }) {
        return loaders.userLoader.loadMany(parent.users);
      },
    },
    tasks: {
      type: new GraphQLList(TaskType),
      resolve(parent, args, { loaders }) {
        return loaders.taskLoader.loadMany(parent.tasks);
      },
    },
  }),
});

// User Type
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    role: { type: GraphQLString },
    organization: {
      type: OrganizationType,
      resolve(parent, args, { loaders }) {
        return loaders.organizationLoader.load(parent.organizationId);
      },
    },
    tasks: {
      type: new GraphQLList(TaskType),
      resolve(parent, args, { loaders }) {
        return loaders.taskLoader.loadMany(parent.tasks);
      },
    },
  }),
});

// Task Type
const TaskType = new GraphQLObjectType({
  name: 'Task',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    dueDate: { type: GraphQLString },
    user: {
      type: UserType,
      resolve(parent, args, { loaders }) {
        return loaders.userLoader.load(parent.userId);
      },
    },
    organization: {
      type: OrganizationType,
      resolve(parent, args, { loaders }) {
        return loaders.organizationLoader.load(parent.organizationId);
      },
    },
  }),
});

module.exports = { OrganizationType, UserType, TaskType };
