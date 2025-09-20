// Mock data consistent with articles
const mockData = {
  clients: [
    {
      id: "CLT-123",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1-555-0123",
      address: "123 Main St, New York",
    },
    {
      id: "CLT-456",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1-555-0456",
      address: "456 Oak Ave, Boston",
    },
  ],

  products: [
    {
      id: "PROD-1",
      name: "Organic Apples",
      description: "Fresh organic apples",
      price: "5.99",
      category: "CAT-FOOD",
      __typename: "FoodProduct",
      expirationDate: "2025-09-15",
    },
    {
      id: "PROD-2",
      name: "Laptop Charger",
      description: "Universal laptop charger",
      price: "49.99",
      category: "CAT-ELECTRONICS",
      __typename: "NonFoodProduct",
      warrantyPeriod: "12",
    },
    {
      id: "PROD-3",
      name: "Organic Milk",
      description: "Fresh organic milk",
      price: "3.50",
      category: "CAT-FOOD",
      __typename: "FoodProduct",
      expirationDate: "2025-09-10",
    },
    {
      id: "PROD-4",
      name: "Bluetooth Speaker",
      description: "Portable wireless speaker",
      price: "89.99",
      category: "CAT-ELECTRONICS",
      __typename: "NonFoodProduct",
      warrantyPeriod: "24",
    },
  ],

  orders: [
    {
      id: "ORD-001",
      date: new Date("2025-08-29"),
      status: "NEW",
      clientId: "CLT-123",
      items: [
        {
          id: "ITEM-1",
          productId: "PROD-1",
          quantity: 2,
          price: "5.99",
        },
        {
          id: "ITEM-2",
          productId: "PROD-2",
          quantity: 1,
          price: "49.99",
        },
      ],
    },
    {
      id: "ORD-002",
      date: new Date("2025-08-28"),
      status: "COMPLETED",
      clientId: "CLT-456",
      items: [
        {
          id: "ITEM-3",
          productId: "PROD-1",
          quantity: 2,
          price: "5.99",
        },
      ],
    },
  ],
};

// Working copies of data
const clients = [...mockData.clients];
const products = [...mockData.products];
let orders = [...mockData.orders];

// Counters for new IDs
let orderIdCounter = 3;
let itemIdCounter = 5;

module.exports = {
  clients,
  products,
  orders,
  orderIdCounter,
  itemIdCounter
};