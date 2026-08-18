import { Stack, Duration, RemovalPolicy } from 'aws-cdk-lib';
import dynamodb from 'aws-cdk-lib/aws-dynamodb';
import lambda from 'aws-cdk-lib/aws-lambda';
import apigateway from 'aws-cdk-lib/aws-apigateway';
import path from 'path';

class RestaurantApiStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'RestaurantsTable', {
      tableName: 'Restaurants',
      partitionKey: { name: 'restaurantId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY, 
    });

    const commonEnv = { TABLE_NAME: table.tableName };
    const lambdaDir = path.join(import.meta.dirname, '..', 'lambda');

    const makeFunction = (id, handlerFile) =>
      new lambda.Function(this, id, {
        functionName: `Restaurant-${id}`,
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: `${handlerFile}.handler`,
        code: lambda.Code.fromAsset(lambdaDir),
        environment: commonEnv,
        timeout: Duration.seconds(10),
      });

    const createFn = makeFunction('CreateRestaurant', 'createRestaurant');
    const getFn = makeFunction('GetRestaurant', 'getRestaurant');
    const listFn = makeFunction('ListRestaurants', 'listRestaurants');
    const updateFn = makeFunction('UpdateRestaurant', 'updateRestaurant');
    const deleteFn = makeFunction('DeleteRestaurant', 'deleteRestaurant');

    table.grantWriteData(createFn);
    table.grantReadData(getFn);
    table.grantReadData(listFn);
    table.grantReadWriteData(updateFn);
    table.grantReadWriteData(deleteFn);

    const api = new apigateway.RestApi(this, 'RestaurantApi', {
      restApiName: 'Restaurant Service',
      description: 'CRUD API for managing restaurants (Sunday Class Task)',
      deployOptions: { stageName: 'prod' },
    });

    const restaurants = api.root.addResource('restaurants'); 
    restaurants.addMethod('POST', new apigateway.LambdaIntegration(createFn)); 
    restaurants.addMethod('GET', new apigateway.LambdaIntegration(listFn));

    const restaurant = restaurants.addResource('{id}');
    restaurant.addMethod('GET', new apigateway.LambdaIntegration(getFn)); 
    restaurant.addMethod('PUT', new apigateway.LambdaIntegration(updateFn)); 
    restaurant.addMethod('DELETE', new apigateway.LambdaIntegration(deleteFn));

    this.apiUrl = api.url;
  }
}

export { RestaurantApiStack };
