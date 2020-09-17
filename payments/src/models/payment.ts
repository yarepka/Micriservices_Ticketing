import mongoose from 'mongoose';

// An interface that describes the properties 
// that are required to create a new Payment
interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

// An interface that describes the properties/fields 
// that a SAVED Payment Document has, it can differ from
// PaymentAttrs properties, that is the reason this interface
// was created
interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

// An interface that describes the properties
// we assign to User model, model represents the 
// entire collection of data
interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  stripeId: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };