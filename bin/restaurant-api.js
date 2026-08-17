#!/usr/bin/env node
import cdk from 'aws-cdk-lib';
import { RestaurantApiStack } from '../lib/restaurant-api-stack.js';

const app = new cdk.App();
new RestaurantApiStack(app, 'RestaurantApiStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});
