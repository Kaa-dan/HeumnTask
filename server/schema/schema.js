const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull, GraphQLList } = require('graphql');
const { OrganizationType, UserType, TaskType } = require('./types');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Task = require('../models/Task');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    organizations: {
      type: new GraphQLList(OrganizationType),
      resolve: (parent, args, { req }) => {
        if (req.user.role !== 'Admin') {
          throw new Error('Unauthorized');
        }
        return Organization.find();
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve: (parent, args, { req }) => {
        if (req.user.role !== 'Admin') {
          throw new Error('Unauthorized');
        }
        return User.find({ organizationId: req.user.organizationId });
      },
    },
    tasks: {
      type: new GraphQLList(TaskType),
      resolve: (parent, args, { req }) => {
        return Task.find({ organizationId: req.user.organizationId });
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createOrganization: {
      type: OrganizationType,
      args: { name: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: (parent, args, { req }) => {
        if (req.user.role !== 'Admin') {
          throw new Error('Unauthorized');
        }
        return new Organization(args).save();
      },
    },
    createUser: {
      type: UserType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        role: { type: new GraphQLNonNull(GraphQLString) },
        organizationId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args, { req }) => {
        if (req.user.role !== 'Admin') {
          throw new Error('Unauthorized');
        }
        const hashedPassword = await bcrypt.hash(args.password, 12);
        const user = new User({ ...args, password: hashedPassword });
        return user.save();
      },
    },
    createTask: {
      type: TaskType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        status: { type: GraphQLString },
        dueDate: { type: GraphQLString },
        userId: { type: new GraphQLNonNull(GraphQLID) },
        organizationId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, args, { req }) => {
        if (req.user.role === 'User' && req.user.id.toString() !== args.userId.toString()) {
          throw new Error('Unauthorized');
        }
        if (req.user.role === 'Manager' && req.user.organizationId.toString() !== args.organizationId.toString()) {
          throw new Error('Unauthorized');
        }
        return new Task(args).save();
      },
    },
    register: {
      type: UserType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        role: { type: new GraphQLNonNull(GraphQLString) },
        organizationId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        const hashedPassword = await bcrypt.hash(args.password, 12);
        const user = new User({ ...args, password: hashedPassword });
        return user.save();
      },
    },
    login: {
      type: GraphQLString,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, { username, password }) => {
        const user = await User.findOne({ username });
        if (!user) {
          throw new Error('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new Error('Invalid credentials');
        }
        return generateToken(user);
      },
    },
    updateTask: {
      type: TaskType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString },
        dueDate: { type: GraphQLString },
      },
      resolve: async (parent, args, { req }) => {
        const task = await Task.findById(args.id);
        if (!task) {
          throw new Error('Task not found');
        }
        if (req.user.role === 'User' && req.user.id.toString() !== task.userId.toString()) {
          throw new Error('Unauthorized');
        }
        if (req.user.role === 'Manager' && req.user.organizationId.toString() !== task.organizationId.toString()) {
          throw new Error('Unauthorized');
        }
        Object.keys(args).forEach((key) => {
          if (args[key] !== undefined) {
            task[key] = args[key];
          }
        });
        return task.save();
      },
    },
    deleteTask: {
      type: TaskType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, { id }, { req }) => {
        const task = await Task.findById(id);
        if (!task) {
          throw new Error('Task not found');
        }
        if (req.user.role === 'User' && req.user.id.toString() !== task.userId.toString()) {
          throw new Error('Unauthorized');
        }
        if (req.user.role === 'Manager' && req.user.organizationId.toString() !== task.organizationId.toString()) {
          throw new Error('Unauthorized');
        }
        await task.remove();
        return task;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});
