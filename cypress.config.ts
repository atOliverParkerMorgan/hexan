import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: '2s9gwr',
  e2e: {
    baseUrl: 'http://localhost:8000'
  }
})