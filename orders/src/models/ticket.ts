import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { Order, OrderStatus } from './order';

// An interface that describes the properties 
// that are required to create a new Ticket
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
};

// An interface that describes the properties/fields 
// that a SAVED Ticket Document has, it can differ from
// TicketAttrs properties, that is the reason this interface
// was created
export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>
};

// An interface that describes the properties
// we assign to User model, model represents the 
// entire collection of data
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  // queries the Ticket of 'version = data.version - 1' / 'version = event.version - 1'
  // and '_id = data.id' / '_id = event.id'
  findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
};

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true,
    min: 0 // price can't be negative
  }
}, {
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

// add method to Model
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price
  });
}

// query previous version Ticket, previous relativly to 
// event data.version/event.version
ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1
  })
};

// add method to Document
ticketSchema.methods.isReserved = async function () {
  // this === the ticket document that we just called 'isReserved' on
  // in order for this to work, use function() instead arrrow function

  // Make sure that this ticket is not already reserved
  // Run query to look at all orders. Find an order where the ticket
  // is the ticket we just found *and* the orders status is *not*
  // cancelled. If whe find an order from that means the ticket *is*
  // reserved
  const existingOrder = await Order.findOne({
    ticket: this, // it'll pull out the ID of ticket
    status: {
      $in: [ // status should be one of this which are below
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ]
    }
  });

  return !!existingOrder;
}


const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };