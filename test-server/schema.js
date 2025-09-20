const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date

  enum OrderStatus {
    NEW
    PROCESSING
    COMPLETED
    CANCELLED
  }

  enum OrderSortField {
    DATE
    TOTAL_AMOUNT
    STATUS
  }

  enum SortOrder {
    ASC
    DESC
  }

  type Client {
    id: ID!
    name: String!
    email: String!
    phone: String!
    address: String
    orders(
      status: OrderStatus,
      sortBy: OrderSortField,
      sortDirection: SortOrder
    ): [Order!]!
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: String!
    category: ID!
  }

  interface ProductInterface {
    id: ID!
    name: String!
    description: String
    price: String!
    category: ID!
  }

  type FoodProduct implements ProductInterface {
    id: ID!
    name: String!
    description: String
    price: String!
    category: ID!
    expirationDate: String!
  }

  type NonFoodProduct implements ProductInterface {
    id: ID!
    name: String!
    description: String
    price: String!
    category: ID!
    warrantyPeriod: String!
  }

  type OrderItem {
    id: ID!
    product: Product!
    quantity: Int!
    price: String!
    subtotal: String!
  }

  type Order {
    id: ID!
    date: Date!
    status: OrderStatus!
    items: [OrderItem!]!
    client: Client!
    totalAmount: String!
  }

  type OrderStatusUpdate {
    orderId: ID!
    oldStatus: OrderStatus!
    newStatus: OrderStatus!
    updatedAt: String!
    order: Order!
  }

  input CreateOrderInput {
    clientId: ID!
    items: [OrderItemInput!]!
    comment: String
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input UpdateOrderStatusInput {
    orderId: ID!
    newStatus: OrderStatus!
  }

  type OrderConnection {
    edges: [OrderEdge]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type OrderEdge {
    node: Order
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type Query {
    client(id: ID!): Client
    products: [ProductInterface!]!
    order(id: ID!): Order!
    orders(
      orderStatus: OrderStatus
      first: Int
      after: String
    ): OrderConnection!
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(input: UpdateOrderStatusInput!): OrderStatusUpdate!
  }

  type Subscription {
    orderStatusChanged(orderId: ID!): OrderStatusUpdate!
    newOrderCreated: Order!
  }
`;

module.exports = typeDefs;