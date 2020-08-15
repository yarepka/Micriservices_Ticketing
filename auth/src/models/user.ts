import mongoose from 'mongoose';
import { Password } from '../services/password';

// An interface that describes the properties 
// that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
};

// An interface that describes the properties
// that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties 
// that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  }
});

// whener we try to save document to the database, 
// second argument function will be called

// if we use arrow function then the value of "this"
// will be overriden and would be equal to the context
// of this entire file as opposed to(v otlichie ot) our
// use document
userSchema.pre('save', async function (done) {
  // if password was not modified, well then we don't want
  // to rehash it. Only hash password if it was modified
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };