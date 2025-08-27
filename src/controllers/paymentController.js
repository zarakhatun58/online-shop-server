import Stripe from 'stripe';
import dotenv from 'dotenv';
import cosmeticOrder from '../models/Order.js';
import { sendNotification } from '../utils/sendNotification.js';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ------------------ Create Checkout Session ------------------
export const createCheckoutSession = async (req, res) => {
  const { items, email, address } = req.body;
  const userId = req.user._id;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items provided' });
  }

  try {
    const amount = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    const order = await cosmeticOrder.create({
      user: userId,
      items: items.map((i) => ({ product: i._id, qty: i.qty })),
      amount,
      address,
      payment: {
        provider: 'stripe',
        orderId: '',
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: items.map((i) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: i.name },
          unit_amount: Math.round(i.price * 100),
        },
        quantity: i.qty,
      })),
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/?order_id=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancelled`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString(),
        address: address?.toString() || 'Not provided',
      },
    });

    order.payment.orderId = session.id;
    await order.save();
    res.status(200).json({ sessionId: session.id, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------ Get All Orders ------------------
export const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await cosmeticOrder.find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------ Update Payment Status ------------------
export const updatePaymentStatus = async (req, res) => {
  const { sessionId, paymentStatus, paymentId } = req.body;

  try {
    const order = await cosmeticOrder.findOne({ 'payment.orderId': sessionId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = paymentStatus;
    order.payment.paymentId = paymentId || '';
    await order.save();

    res.json({ message: 'Payment status updated', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const order = await cosmeticOrder.findOne({ 'payment.orderId': session.id });
      if (!order) {
        console.warn('Order not found for session:', session.id);
        return res.status(404).json({ error: 'Order not found' });
      }

      // Update order status
      order.status = 'paid';
      order.payment.paymentId = session.payment_intent;
      await order.save();

      // Save notification in DB
      const notification = await cosmeticNotification.create({
        userId: order.user.toString(),
        title: 'Payment Success 💳',
        message: `Your payment for Order ${order._id} was successful!`,
        type: 'success',
      });

      // Emit via socket
      sendNotification(order.user.toString(), 'notification', {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        createdAt: notification.createdAt,
      });

      console.log('✅ Order updated and notification sent:', order._id);
    } catch (err) {
      console.error('Webhook handler failed:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  res.json({ received: true });
};
