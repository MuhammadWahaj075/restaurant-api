import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME;

const headers = { 'Content-Type': 'application/json' };

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'restaurantId path parameter is required' }),
      };
    }

    const existing = await client.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { restaurantId: id },
      })
    );

    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: `Restaurant ${id} not found` }),
      };
    }

    await client.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { restaurantId: id },
      })
    );

    return {
      statusCode: 204,
      headers,
      body: '',
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
