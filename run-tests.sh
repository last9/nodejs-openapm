setupNext() {
  echo "Setting up Next.js"
  npx next build ./tests/nextjs
}

setupPrisma() {
  echo "Setting up Prisma"
  npx prisma generate --schema=./tests/prisma/schema.prisma
  npx prisma migrate dev --schema=./tests/prisma/schema.prisma --name init
}

# Run all tests
runAllTests() {
  setupNext
  setupPrisma
  npm run vitest
}

# Run Next.js tests
runNextJsTests() {
  setupNext
  npm run vitest -t ./tests/nextjs/nextjs.test.ts
}

# Run Nest.js tests
runNestJsTests() {
  npm run vitest -t ./tests/nestjs/nestjs.test.ts
}

# Run Prisma tests
runPrismaTests() {
  setupPrisma
  npm run vitest -t ./tests/prisma/*.test.ts 
}

# Run MySQL tests
runMysqlTests() {
  npm run vitest -t ./tests/mysql2.test.ts
}

# Check if a variable is passed
if [ "$1" = "express" ]; then
  npm run vitest -t ./tests/express.test.ts 
elif [ "$1" = "nextjs" ]; then
  # Run Next.js tests without setting up
  if [ "$2" = "--no-setup" ]; then
    npm run vitest -t ./tests/nextjs/nextjs.test.ts
  else
    runNextJsTests
  fi
elif [ "$1" = "nestjs" ]; then
    runNestJsTests
elif [ "$1" = "prisma" ]; then
  runPrismaTests
elif [ "$1" = "mysql2" ]; then
  runAllTests
else
  runAllTests
fi