const express = require('express');
const router = express.Router();

const { Order, validate } = require('../model/orders');
const { User } = require('../model/userM');
const { Product } = require('../model/product');
const wrapper = require('../middleware/wrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const bodyValidator = require('../middleware/requestBodyVerifier');
const idValidator = require("../middleware/idVerifier");

const adminMiddle = [ auth, admin ];
const authIdValidator = [ auth, idValidator ]
const idAdminMiddleware = [ idValidator, auth, admin ];
const idBodyAdminMiddleware = [ 
    idValidator, bodyValidator(validate), 
    auth, admin
]

router.get('/all', adminMiddle, wrapper ( async (req, res) => {
    const orders = await Order.find()
        .populate({ path: productId, select: { name: 1} })
        .populate({ path: 'customerId', 
            select: { 
                firstName: 1, lastName: 1, 
                email: 1, phoneNumber, address
            } 
        })
        .sort({ orderTime: -1 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: orders
    });
}));

//**  must be admin  new??
router.get('/get-all-recieved', async (req, res) => {
    const orders = await Orders.find()
        .and([ { recieved: true }, { marked: false } ])
        .populate({ path: productId, select: { name: 1 } })
        .populate({ path: 'customerId', 
            select: { 
                firstName: 1, lastName: 1, 
                email: 1, phoneNumber, address
            } 
        })
        .sort({ orderTime: -1 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: orders
    });
});

// ??only admins new handler
router.put('/mark-order/:orderId', idAdminMiddleware, wrapper ( async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({
            status: 404,
            message: 'no such order in the db'
        });
    } else {
        if (!order.recieved) {
            return res.status(400).json({
                status: 400,
                message: 'you cant mark an order that is not recieved'
            });
        } else {
            order.marked = true;

            await order.save();

            res.status(200).json({
                status: 200,
                message: 'success',
                data: 'the order has been marked'
            })
        }
    }
}));

// ** new handler
router.get('/get-all-not-recieved', adminMiddle, wrapper ( async (req, res) => {
    const orders = await Orders.find({ recieved: true })
        .populate({ path: productId, select: { name: 1} })
        .populate({ path: 'customerId', 
            select: { 
                firstName: 1, lastName: 1, 
                email: 1, phoneNumber, address
            } 
        })
        .sort({ orderTime: -1 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: orders
    })
}));

router.get('/fufilled', adminMiddle, wrapper (async ( req, res) => {
    const orders = await Order.find({ fufilled: true })
        .populate({ path: productId, select: { name: 1} })
        .populate({ path: 'customerId', 
            select: { 
                firstName: 1, lastName: 1, 
                email: 1, phoneNumber, address
            } 
        })
        .sort({ orderTime: -1 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: orders
    });
}));

router.get('/not-fufilled', adminMiddle, wrapper (async ( req, res) => {
    const orders = await Order.find({ fufilled: false })
        .populate({ path: productId, select: { name: 1} })
        .populate({ path: 'customerId', 
            select: { 
                firstName: 1, lastName: 1, 
                email: 1, phoneNumber, address
            } 
        })
        .sort({ orderTime: -1 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: orders
    });
}));

router.get('/:id', idAdminMiddleware, wrapper (async ( req, res) => {
    const { id } = req.params;

    const order = await Order.findById(id)
        .populate({ pathId: 'productId', select: { name: 1 } })
        .populate({ path: 'customerId', select: { firstName: 1 } })

    if (!order) {
        return res.status(404).json({
            status: 404,
            message: 'no such order in the db...'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: order
        });
    }
}));

router.put('/fulfil-order/:id', idAdminMiddleware, wrapper ( async ( req, res) => {
    const { id } =  req.params;

    const order = await Order.findByIdAndUpdate(id, {
        $set: { fufilled: true }
    }, { new: true });

    if (!order) {
        return res.status(404).json({
            status: 404,
            message: 'no such order in the db'
        })
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: order
        });
    }
}));

router.post('/make-order/:productId', idBodyAdminMiddleware, wrapper ( async (req, res) => {
    const customerId = req.user._id;
    const { productId } = req.params;
    const { amount } = req.query;

    const product = await Product.findById(productId);
        
    if (!product) {
        return res.status(404).json({
            status: 404,
            message: 'no such product in the store..'
        });
    } else {
        if (product.amountInStock == 0) {
            return res.status(404).json({
                status: 404,
                message: 'were currently out of stuck for this product'
            });
        }

        const user = await User.findById(customerId)
            .select({ password: 0 })

        const order = new Order({
            customerId,
            productId,
            amount: amount || 1,
        });

        const userOrderSchema = {
            productId,
            amount: amount || 1,
            _id: order._id,
            dateToRecieve: 'we do not know'
        }
        user.orders.push(userOrderSchema);

        product.amountInStock--;
        product.amountSold++;

        await product.save();
        await order.save();
        await user.save();

        res.status(200).json({
            status: 200,
            message: 'success',
            data: order
        });
    }
}));

// ?? new router
router.put('/confirm-order/:orderId', authIdValidator, wrapper ( async ( req, res) => {
    const userId = req.user._id;
    const { orderId } = req.params;

    const user = await User.findById(userId);
    const order = await Order.findById(orderId);
    const userOrders = user.orders;

    let isUsersOrders;
    userOrders.forEach((order, index) => {
        if (order._id == orderId) {
            isUsersOrders = index;
        }
    });

    if (typeof isUsersOrders !== 'number') {
        return res.status(404).json({
            status: 404,
            message: 'no such order exist..'
        });
    } else {
        const theOrder = userOrders[isUsersOrders];

        if (theOrder.recieved) {
            return res.status(404).json({
                status: 404,
                message: 'youve once confirmed this order'
            });
        } else {
            user.orders[isUsersOrders].recieved = true;
            order.recieved = true;

            await user.save();
            await order.save();

            res.status(200).json({
                status: 200,
                message: 'success',
                data: 'we hope you enjoy our product'
            })
        }
    }
}));

router.delete('/:id', idAdminMiddleware, wrapper ( async ( req, res) => {
    const { id } = req.params;

    const order = await Order.findByIdAndRemove(id);

    if (!order) {
        return res.status(404).json({
            status: 404,
            message: 'no such order in the dbb...'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: order
        });
    }
}));

module.exports = router;