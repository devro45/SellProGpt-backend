const { Order, ProductCart } = require("../models/order");
exports.getOrderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("products.product", "name price")
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          error: "Order not found in database",
        });
      }
      req.order = order;
      next();
    })
    .catch((err) => {
      res.status(400).json({
        error: "Error occurred while fetching order",
      });
    });
};

exports.createOrder = (req, res) => {
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  order.save((err, order) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to proceed your order",
      });
    }
    res.json(order);
  });
};

exports.getAllOrders = (req, res) => {
  Order.find()
    .populate("user", "_id name")
    .then((orders) => {
      if (orders.length === 0) {
        return res.status(400).json({
          error: "No orders found in database",
        });
      }
      res.json(orders);
    })
    .catch((err) => {
      res.status(400).json({
        error: "Error occurred while fetching orders",
      });
    });
};

exports.getOrderStatus = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateOrderStatus = (req, res) => {
  Order.updateOne(
    { _id: req.body.orderId },
    { $set: { status: req.body.status } },
    (err, order) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to update the order status",
        });
      }
      res.json(order);
    }
  );
};
