import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// An interface that describes the properties 
// that are required to create a new Ticket
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

// An interface that describes the properties 
// that a SAVED Ticket Document has
interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;
}

// An interface that describes the properties
// we assign to Ticket model, model represents the 
// entire collection of data
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  userId: {
    type: String,
    required: true
  },

  orderId: {
    type: String
  }
}, {
  // reformat the way object looks whenever format to JSON
  /* 
    old look
    {
      "_id": "bopjg0934t0934",
      "title": "Title",
      "userId": "5fds7345fsdtg765",
      "__v: 0"
    }

    new look
    {
      "title": "Title",
      "userId": "5fds7345fsdtg765",
      "id": "bopjg0934t0934"
      "__v: 0"
    }
  */
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

// instead of default '__v' field use 'version'
ticketSchema.set('versionKey', 'version');
// use mongoose-update-if-current(check npm for doc) module
// for 'optimistic concurrency control' (OCC)
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };

