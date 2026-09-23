# NodeJS,Mongoose,Express Project in MVC Architecture
## E-commcerce Backend

**Supported version of nodejs >= 12**,
**Supported version of mongoose >= 6**

## About 
- This is a Node application, developed using MVC pattern with Node.js, ExpressJS, and Mongoose. 
- MongoDB database is used for data storage, with object modeling provided by Mongoose.

## Features

- **Product Management**: Create, read, update, and delete products.
- **Order Management**: Handle orders, including creation, cancellation, and status updates.
- **User Authentication**: Secure user authentication and authorization.
- **RESTful APIs**: Follows RESTful principles for easy integration with front-end applications.

## Initial
1. Install all dependency
```$ npm install```

2. Start development server
```$ npm run dev```

## How to use generated APIs:
[Click here to visit documentation](<https://documenter.getpostman.com/view/29989032/2sA3JKbgaq/> "API Documentation")

## Handling concurrent stock updates

**Q: Two users try to buy the last available item at the same time. How do you make sure stock doesn't go negative and both orders don't get confirmed?**

Rely on MongoDB's atomic document updates instead of a read-then-write check in application code. A "read stock, check if > 0, then decrement" pattern is not safe, because both requests can read the same stock value before either one writes.

Instead, decrement and validate in a single atomic operation:

```js
const product = await Product.findOneAndUpdate(
  { _id: productId, stock: { $gt: 0 } }, // only matches if stock is still available
  { $inc: { stock: -1 } },
  { new: true }
);

if (!product) {
  // stock was already 0 (or another request just took the last unit)
  throw new Error("Product is out of stock");
}

// stock was safely decremented — proceed to create the order
```

Because `findOneAndUpdate` is atomic at the document level, MongoDB guarantees that only one of the two concurrent requests can match `stock: { $gt: 0 }` and apply the decrement when stock is at `1`. The second request's filter no longer matches (stock is now `0`), so it returns `null` and its order is rejected — stock never goes below zero and only one order is confirmed.

If checkout needs to update more than one collection consistently (e.g. decrementing `products` **and** creating a document in `orders`), wrap both writes in a MongoDB multi-document transaction (`session.withTransaction`) so they commit or roll back together, keeping the two collections in sync even if one write fails.