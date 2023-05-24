# Example Project from [A First Look at PostGraphile with Railway](https://ajcwebdev.com/2021/07/17/a-first-look-at-postgraphile-with-railway)

PostGraphile builds a GraphQL API from a PostgreSQL schema that automatically detects tables, columns, indexes, relationships, views, types, functions, and comments. It combines PostgreSQL's [role-based grant system](https://www.postgresql.org/docs/current/static/user-manag.html) and [row-level security policies](https://www.postgresql.org/docs/current/static/ddl-rowsecurity.html) with Graphile Engine's [GraphQL look-ahead](https://www.graphile.org/graphile-build/look-ahead/) and [plugin expansion](https://www.graphile.org/graphile-build/plugins/) technologies.

## Clone Repo and Navigate to Project

```bash
git clone https://github.com/ajcwebdev/a-first-look.git
cd backend/postgraphile-railway
```