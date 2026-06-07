import { defineBackend } from '@aws-amplify/backend'
import { agentFunction } from './functions/agent/resource'
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda'

const backend = defineBackend({
  agentFunction,
})

const fn = backend.resources.agentFunction.resources.lambda

const fnUrl = fn.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
})

backend.addOutput({
  custom: {
    apiUrl: fnUrl.url,
  },
})
