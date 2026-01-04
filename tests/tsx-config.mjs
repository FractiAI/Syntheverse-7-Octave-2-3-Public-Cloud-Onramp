import { register } from 'tsx/cjs/api'
import { resolve } from 'path'

// Register tsx with path alias support
register({
  tsconfig: resolve(process.cwd(), 'tsconfig.test.json'),
})

