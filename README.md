# Restaurant API (AWS CDK - JavaScript)

Serverless CRUD API for managing restaurants, built with:

- **AWS CDK v2 (JavaScript)** – Infrastructure as Code
- **AWS Lambda (Node.js 20.x)** – business logic
- **Amazon API Gateway (REST API)** – HTTP layer
- **Amazon DynamoDB** – data storage

> Authorization is intentionally **not** included (out of scope for this task).

---

## Architecture

```
Client → API Gateway (REST API) → Lambda (per operation) → DynamoDB Table: Restaurants
```

| Route                  | Method | Lambda               | Description              |
|-------------------------|--------|-----------------------|---------------------------|
| `/restaurants`          | POST   | CreateRestaurant       | Create a new restaurant   |
| `/restaurants`          | GET    | ListRestaurants        | List all restaurants      |
| `/restaurants/{id}`     | GET    | GetRestaurant           | Get one restaurant by ID  |
| `/restaurants/{id}`     | PUT    | UpdateRestaurant        | Update a restaurant       |
| `/restaurants/{id}`     | DELETE | DeleteRestaurant        | Delete a restaurant       |

## DynamoDB Table Schema

**Table name:** `Restaurants`
**Billing mode:** Pay per request (on-demand)

| Attribute      | Type   | Notes                          |
|----------------|--------|----------------------------------|
| `restaurantId` | String | Partition key (UUID, auto-generated) |
| `name`         | String | Restaurant name                  |
| `cuisine`      | String | e.g. Pakistani, Continental      |
| `address`      | String | Physical address                 |
| `rating`       | Number | 0–5                               |
| `createdAt`    | String | ISO timestamp                    |
| `updatedAt`    | String | ISO timestamp                    |

## Project Structure

```
restaurant-api-cdk/
├── bin/restaurant-api.js         # CDK app entry point
├── lib/restaurant-api-stack.js   # CDK stack (DynamoDB + Lambdas + API Gateway)
├── lambda/
│   ├── createRestaurant.js       # POST   /restaurants
│   ├── listRestaurants.js        # GET    /restaurants
│   ├── getRestaurant.js          # GET    /restaurants/{id}
│   ├── updateRestaurant.js       # PUT    /restaurants/{id}
│   └── deleteRestaurant.js       # DELETE /restaurants/{id}
├── openapi/restaurant-api.yaml   # OpenAPI 3.0 spec
├── postman/Restaurant-API.postman_collection.json
├── package.json
├── cdk.json
└── README.md
```

## Prerequisites

- Node.js 18+
- AWS CLI configured (`aws configure`)
- AWS CDK CLI (`npm install -g aws-cdk`) — or use `npx cdk`

## Deploy

```bash
npm install
npx cdk bootstrap      # only needed once per AWS account/region
npx cdk deploy
```

After deploy, CDK prints the API Gateway base URL, e.g.:

```
RestaurantApiStack.RestaurantApiEndpointXXXXXXXX = https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/
```

Use this as `baseUrl` in Postman / OpenAPI server URL.

## API Documentation

Full request/response documentation: [`openapi/restaurant-api.yaml`](./openapi/restaurant-api.yaml)
(open it at https://editor.swagger.io to view it rendered).

### 1. Create Restaurant

`POST /restaurants`

Request body:
```json
{
  "name": "Karachi Biryani House",
  "cuisine": "Pakistani",
  "address": "Tariq Road, Karachi",
  "rating": 4.5
}
```

Response `201 Created`:
```json
{
  "restaurantId": "b3f1e2b0-6c1a-4a2e-9d3b-1a2b3c4d5e6f",
  "name": "Karachi Biryani House",
  "cuisine": "Pakistani",
  "address": "Tariq Road, Karachi",
  "rating": 4.5,
  "createdAt": "2026-08-17T10:00:00.000Z",
  "updatedAt": "2026-08-17T10:00:00.000Z"
}
```

Response `400 Bad Request` (missing fields):
```json
{ "message": "name, cuisine and address are required" }
```

### 2. List Restaurants

`GET /restaurants`

Response `200 OK`:
```json
{
  "count": 1,
  "items": [
    {
      "restaurantId": "b3f1e2b0-6c1a-4a2e-9d3b-1a2b3c4d5e6f",
      "name": "Karachi Biryani House",
      "cuisine": "Pakistani",
      "address": "Tariq Road, Karachi",
      "rating": 4.5,
      "createdAt": "2026-08-17T10:00:00.000Z",
      "updatedAt": "2026-08-17T10:00:00.000Z"
    }
  ]
}
```

### 3. Get Restaurant by ID

`GET /restaurants/{id}`

Response `200 OK`: same shape as a single item above.

Response `404 Not Found`:
```json
{ "message": "Restaurant b3f1e2b0-6c1a-4a2e-9d3b-1a2b3c4d5e6f not found" }
```

### 4. Update Restaurant

`PUT /restaurants/{id}` — partial update, send only fields to change.

Request body:
```json
{
  "rating": 4.8,
  "address": "Tariq Road, Block 2, Karachi"
}
```

Response `200 OK`:
```json
{
  "restaurantId": "b3f1e2b0-6c1a-4a2e-9d3b-1a2b3c4d5e6f",
  "name": "Karachi Biryani House",
  "cuisine": "Pakistani",
  "address": "Tariq Road, Block 2, Karachi",
  "rating": 4.8,
  "createdAt": "2026-08-17T10:00:00.000Z",
  "updatedAt": "2026-08-17T11:15:00.000Z"
}
```

Response `404 Not Found`:
```json
{ "message": "Restaurant does-not-exist not found" }
```

### 5. Delete Restaurant

`DELETE /restaurants/{id}`

Response: `204 No Content` (empty body)

Response `404 Not Found`:
```json
{ "message": "Restaurant does-not-exist not found" }
```

## Postman Collection

Import [`postman/Restaurant-API.postman_collection.json`](./postman/Restaurant-API.postman_collection.json) into Postman.

1. Set collection variable `baseUrl` to your deployed API Gateway URL (without trailing slash).
2. Run **Create Restaurant** first — it auto-saves the returned `restaurantId` into the `restaurantId` collection variable via a test script.
3. Run **List / Get / Update / Delete** — they reuse `{{restaurantId}}` automatically.

Each request in the collection has a saved example response (success + error) for documentation purposes.

## Useful CDK commands

| Command            | What it does                                  |
|---------------------|------------------------------------------------|
| `npx cdk synth`     | Print the generated CloudFormation template     |
| `npx cdk deploy`    | Deploy the stack to AWS                         |
| `npx cdk diff`      | Compare deployed stack with local changes       |
| `npx cdk destroy`   | Tear down all resources                         |
