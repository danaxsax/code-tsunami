import { defineFunction, secret } from '@aws-amplify/backend'

export const agentFunction = defineFunction({
  name: 'agent',
  entry: './handler.ts',
  timeoutSeconds: 120,
  memoryMB: 768,
  environment: {
    LLM_PROVIDER: 'openai',
    OPENAI_MODEL: 'gpt-4o-mini',
    GEMINI_MODEL: 'gemini-2.5-flash',
    CLAUDE_MODEL: 'claude-3-5-haiku-latest',
    ELEVENLABS_MODEL: 'eleven_multilingual_v2',
    DEFAULT_CUSTOMER_PROFILE: '1_0012Eplus18',
    OPENAI_API_KEY: secret('OPENAI_API_KEY'),
    GEMINI_API_KEY: secret('GEMINI_API_KEY'),
    ANTHROPIC_API_KEY: secret('ANTHROPIC_API_KEY'),
    ELEVENLABS_API_KEY: secret('ELEVENLABS_API_KEY'),
  },
})
