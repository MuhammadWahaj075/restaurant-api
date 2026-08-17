import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME;

const headers = { 'Content-Type': 'application/json' };

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    if (!body.name || !body.cuisine || !body.address) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'name, cuisine and address are required' }),
      };
    }

    const now = new Date().toISOString();
    const restaurant = {
      restaurantId: randomUUID(),
      name: body.name,
      cuisine: body.cuisine,
      address: body.address,
      rating: body.rating ?? 0,
      createdAt: now,
      updatedAt: now,
    };

    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: restaurant,
      })
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(restaurant),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
