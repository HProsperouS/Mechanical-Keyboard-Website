const express = require("express")
const OrderManagement = express.Router()
const { Order }  = require("../models/order")
const { OrderItem } = require("../models/order")
const Product = require("../models/product")
const { Payment } = require("../models/order")
const { Cart } = require("../models/cart")
const User = require("../models/User")
const moment = require('moment');
const cron = require('node-cron');

cron.schedule('*/30 * * * * *', async() => {
    console.log('running a task every 30 minute');
    let orders = await Order.findAll({where : {payment_status: 0 }})
    orders.forEach(order => {
        var createAt = moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss')
        console.log(createAt)
        var now = moment().format('YYYY-MM-DD HH:mm:ss')
        console.log(now)
        var minute = moment(now).diff(moment(createAt),'minutes');
        console.log(minute)
        if (minute > 30){
            Order.destroy({where : {id: order.id }});
            OrderItem.destroy({where : {orderid: order.id }});
            console.log("Hello");
        }
  });
});

// Get Orders
OrderManagement.get('/', async (req, res) => {
    const orders = await Order.findAll({
        include: [
            {
                model: OrderItem,
                include: {
                    model: Product
                }
            },
            {
                model: User
            },
        ],
    });

    return res.render('./staff/ordermanagement/staff-getorders', { orders });
});

OrderManagement.get('/deleteorder/:id', async function (req, res) {
    try {
        let order = await Order.findByPk(req.params.id);
        if (!order) {
            flash(res, 'error', 'order not found');
            res.redirect('/staff/manage_order');
            return;
        }
        let result = await Order.destroy({ where: { id: order.id } });
        OrderItem.destroy({where : {orderid: order.id }})
        req.flash("success", "Order" + " is deleted!");
        res.redirect('/staff/manage-orders');
    }
    catch (err) {
        console.log(err);
    }
});


module.exports = OrderManagement
