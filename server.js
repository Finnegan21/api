var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://127.0.0.1/swap-shop');
var Product = require('./model/product');
var WishList = require('./model/wishlist');

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET");
    next();
  });  

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));
app.post('/product', function(request, response) {
    var product = new Product();
    product.title = request.body.title;
    product.price = request.body.price;
    product.save(function(err, savedProduct) {
        if (err) {
            response.status(500).send({error: "Could not save product"});
        } else {
            response.status(200).send(savedProduct);
        }
    })
})

app.get('/product', function(request, response) {
    Product.find({}, function(err, products) {
        if (err) {
            response.status(500).send({error: "Could not fetch product"})
        } else {response.send(products)}
    });
})

app.get('/wishlist', function(request, response) {
    WishList.find({}).populate({path: 'products', model: 'Product'}).exec(function(err, wishLists) {
        if (err) {
            response.status(500).send({error: "Could not fetch wish list"})
        } else {
            response.send(wishLists)
        }
    })
})

app.post('/wishlist', function(request, response) {
    var wishList = new WishList();
    wishList.title = request.body.title;
    wishList.save(function(err, newWishList) {
        if (err) {
            response.status(500).send({error: "Could not create wish list"})
        } else {
            response.send(newWishList)
        }
    })
})

app.put('/wishlist/product/add', function(request, response) {
    Product.findOne({_id: request.body.productId}, function(err, product) {
        if (err) {
            response.status(500).send({error: "Could not add item to wishlist"})
        } else {
            WishList.updateMany({_id: request.body.wishistId}, {$addToSet: {products: product._id}}, function(err, wishlist) {
                if (err) {
                    response.status(500).send({error: "Could not add item to wishlist"})
                } else {
                    response.send("Successfully added to wishlist")
                }
            })
        }
    })
})

app.listen(3004, function() {
    console.log("Swap shop  API running on port 3004...");
})

