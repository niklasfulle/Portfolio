import "@testing-library/jest-dom";

// Unit tests mock Prisma. Integration suites run only when an isolated test DB
// is explicitly configured, but Prisma is imported before those suites skip.
process.env.POSTGRESQL_URL = process.env.PORTFOLIO_INTEGRATION_DATABASE_URL
  ?? "postgresql://coverage:coverage@127.0.0.1:65432/portfolio_unit_test";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
