const { clients, products, orders } = require('./mocks');
let { orderIdCounter, itemIdCounter } = require('./mocks');

// Helper functions
const calculateSubtotal = (quantity, price) => {
  return (parseFloat(price) * quantity).toFixed(2);
};

const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => {
    return total + parseFloat(calculateSubtotal(item.quantity, item.price));
  }, 0).toFixed(2);
};

const getOrderItems = (order) => {
  return order.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      id: item.id,
      product,
      quantity: item.quantity,
      price: item.price,
      subtotal: calculateSubtotal(item.quantity, item.price)
    };
  });
};

// Resolvers
const resolvers = (pubsub) => ({
  Date: {
    serialize: (date) => date.toISOString(),
    parseValue: (value) => new Date(value),
    parseLiteral: (ast) => new Date(ast.value)
  },

  ProductInterface: {
    __resolveType: (product) => {
      return product.__typename || 'Product';
    }
  },

  Query: {
    client: (_, { id }) => {
      return clients.find(client => client.id === id);
    },

    products: () => {
      return products;
    },

    order: (_, { id }) => {
      const order = orders.find(order => order.id === id);
      if (!order) throw new Error(`Order with id ${id} not found`);
      
      const client = clients.find(c => c.id === order.clientId);
      const items = getOrderItems(order);
      
      return {
        ...order,
        client,
        items,
        totalAmount: calculateOrderTotal(order.items)
      };
    },

    orders: (_, { orderStatus, first = 10, after }) => {
      let filteredOrders = orders;
      
      if (orderStatus) {
        filteredOrders = orders.filter(order => order.status === orderStatus);
      }

      // Simple pagination
      const startIndex = after ? parseInt(after) + 1 : 0;
      const endIndex = startIndex + first;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

      const edges = paginatedOrders.map((order, index) => {
        const client = clients.find(c => c.id === order.clientId);
        const items = getOrderItems(order);
        
        return {
          node: {
            ...order,
            client,
            items,
            totalAmount: calculateOrderTotal(order.items)
          },
          cursor: (startIndex + index).toString()
        };
      });

      return {
        edges,
        pageInfo: {
          hasNextPage: endIndex < filteredOrders.length,
          hasPreviousPage: startIndex > 0,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
        },
        totalCount: filteredOrders.length
      };
    }
  },

  Client: {
    orders: (client, { status, sortBy = 'DATE', sortDirection = 'DESC' }) => {
      let clientOrders = orders.filter(order => order.clientId === client.id);
      
      if (status) {
        clientOrders = clientOrders.filter(order => order.status === status);
      }

      // Sorting
      clientOrders.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'DATE':
            comparison = new Date(a.date) - new Date(b.date);
            break;
          case 'TOTAL_AMOUNT':
            const aTotal = parseFloat(calculateOrderTotal(a.items));
            const bTotal = parseFloat(calculateOrderTotal(b.items));
            comparison = aTotal - bTotal;
            break;
          case 'STATUS':
            comparison = a.status.localeCompare(b.status);
            break;
        }
        
        return sortDirection === 'DESC' ? -comparison : comparison;
      });

      return clientOrders.map(order => {
        const client = clients.find(c => c.id === order.clientId);
        const items = getOrderItems(order);
        
        return {
          ...order,
          client,
          items,
          totalAmount: calculateOrderTotal(order.items)
        };
      });
    }
  },

  Mutation: {
    createOrder: (_, { input }) => {
      const client = clients.find(c => c.id === input.clientId);
      if (!client) throw new Error('Client not found');

      const orderItems = input.items.map((item, index) => {
        const product = products.find(p => p.id === item.productId);
        if (!product) throw new Error(`Product with id ${item.productId} not found`);
        
        return {
          id: `ITEM-${itemIdCounter + index}`,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        };
      });

      const newOrder = {
        id: `ORD-${orderIdCounter.toString().padStart(3, '0')}`,
        date: new Date(),
        status: 'NEW',
        clientId: input.clientId,
        items: orderItems
      };

      orders.push(newOrder);
      itemIdCounter += input.items.length;
      orderIdCounter++;

      const orderWithDetails = {
        ...newOrder,
        client,
        items: getOrderItems(newOrder),
        totalAmount: calculateOrderTotal(newOrder.items)
      };

      pubsub.publish('NEW_ORDER_CREATED', {
        newOrderCreated: orderWithDetails
      });

      console.log(`📦 New order created: ${newOrder.id} for client ${client.name}`);

      return orderWithDetails;
    },

    updateOrderStatus: (_, { input }) => {
      const order = orders.find(o => o.id === input.orderId);
      if (!order) throw new Error('Order not found');

      const oldStatus = order.status;
      order.status = input.newStatus;

      const client = clients.find(c => c.id === order.clientId);
      const items = getOrderItems(order);
      
      const orderWithDetails = {
        ...order,
        client,
        items,
        totalAmount: calculateOrderTotal(order.items)
      };

      const statusUpdate = {
        orderId: input.orderId,
        oldStatus,
        newStatus: input.newStatus,
        updatedAt: new Date().toISOString(),
        order: orderWithDetails
      };

      pubsub.publish(`ORDER_STATUS_CHANGED_${input.orderId}`, {
        orderStatusChanged: statusUpdate
      });

      console.log(`📊 Order ${input.orderId} status changed: ${oldStatus} → ${input.newStatus}`);

      return statusUpdate;
    }
  },

  Subscription: {
    orderStatusChanged: {
      subscribe: (_, { orderId }) => {
        if (!orderId) {
          throw new Error('orderId is required for orderStatusChanged subscription');
        }
        return pubsub.asyncIterator([`ORDER_STATUS_CHANGED_${orderId}`]);
      }
    },

    newOrderCreated: {
      subscribe: () => pubsub.asyncIterator(['NEW_ORDER_CREATED'])
    }
  }
});

module.exports = resolvers;