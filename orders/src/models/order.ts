import mongoose from 'mongoose';
import { OrderStatus } from '@yarepkatickets/common';
import { TicketDoc } from './ticket';

// for convinience reasons, everything connected to Order put in the
// order model file
export { OrderStatus };

// An interface that describes the properties 
// that are required to create a new Order
interface OrderAttrs {
  userId: string; // user who is trying to buy a ticket
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
};

// An interface that describes the properties/fields 
// that a SAVED Order Document has, it can differ from
// OrderAttrs properties, that is the reason this interface
// was created
interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
};

// An interface that describes the properties
// we assign to User model, model represents the 
// entire collection of data
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
};

const orderSchema = new mongoose.Schema({
  userId: {
    type: String, // in mongoose - String, in TypeScript - string
    required: true
  },

  status: {
    type: String,
    required: true,
    // mongoose will make sure we set the status to one of the values
    // listed inside this OrderStatus enum
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created
  },

  expiresAt: {
    type: mongoose.Schema.Types.Date
  },

  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };