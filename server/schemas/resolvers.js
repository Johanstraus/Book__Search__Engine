const { User } = require("../models/");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    self: async (parent, args, context, info) => {
      console.log("query activated");

      if (context.user) {
        const user = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
        return user;
      } else {
        console.log("not logged in");
      }
    },
  },

  Mutation: {
    login: async (parent, args, context, info) => {
      const user = await User.findOne({ email: args.email }).populate();

      if (!user) {
        console.log("incorrect user email");
      } else {
        // does the password match the user?
        const correctPW = user.isCorrectPassword(args.password);

        if (!correctPW) {
          console.log("incorrect password");
        } else {
          const token = signToken(user);
          return { token, user };
        }
      }
    },

    addUser: async (parent, args, context, info) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, args, context, info) => {
      if (context.user) {
        const updateUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: args.bookInfo } },
          { new: true }
        );
        return updateUser;
      } else {
        console.log("user cannot be authenticated");
      }
    },

    removeBook: async (parent, { bookId }, context, info) => {
      if (context.user) {
        const updateUser = User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        return updateUser;
      } else {
        console.log("user cannot be authenticated");
      }
    },
  },
};

module.exports = resolvers;
