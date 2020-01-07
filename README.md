Usage examples:

```
  $ rf-lerna zipbundle @xxx/admin-api  --target admin-api.zip
  lerna notice cli v0.1.0
  lerna info PackCommand.execute Packaged @xxx/types to /tmp/2f46060f-f7bc-4d26-aa07-da09d877966e/xxx-types-2.4.0.tgz
  lerna info PackCommand.execute Packaged @xxx/schemas to /tmp/5ffd1989-93c4-4b5b-91d4-ff8b5c1b24c5/xxx-schemas-2.4.6.tgz
  lerna info PackCommand.execute Packaged @xxx/logger to /tmp/a0d80fbd-a58f-41a7-8fc7-29389100dc05/xxx-logger-2.3.0.tgz
  lerna info PackCommand.execute Packaged @xxx/emails to /tmp/232097bb-36e1-419c-8ddd-d820d33f64b7/xxx-emails-2.4.11.tgz
  lerna info PackCommand.execute Packaged @xxx/db to /tmp/943acfe7-942a-437a-b948-b755a6697fe0/xxx-db-2.4.7.tgz
  lerna info PackCommand.execute Packaged @xxx/common to /tmp/8067b11b-2be1-45ec-ac3f-2d3cd38be7fd/xxx-common-2.4.15.tgz
  lerna info PackCommand.execute Packaged @xxx/admin-api to /tmp/60697e7e-a704-47b8-a2a4-c6a13105d4f6/xxx-admin-api-2.4.22.tgz
  lerna info PackCommand.installDependencies Installing dependencies in /tmp/b2fc76f8f2f7d088ebeb30e1475f6331
  lerna info PackCommand.createZipFile Running zip [ '-r', '/home/projects/xxx/xxx-monorepo/admin-api.zip', '.' ] { cwd: '/tmp/b2fc76f8f2f7d088ebeb30e1475f6331/package' }
  Wrote file /home/projects/xxx/xxx-monorepo/admin-api.zip
```

This creates a zip file that has node_modules inside with all the depenendencies installed
(local and external). This is a format required by AWS Lambda handlers.
