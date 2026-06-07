import { defineFunction } from '@aws-amplify/backend'

export const agentFunction = defineFunction({
  name: 'agent',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 512,
})
