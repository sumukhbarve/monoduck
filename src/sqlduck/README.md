# Sqlduck

### What is it?
- Strictly-typed, simple wrapper around Sequelize. Plays well with Zod.

### Quickstart - Contacts Example

In this example, we'll create a model for storing contacts, and then perform CRUD operations.

#### Step 0: Install dependencies:
```sh
npm install monoduck sequelize zod sqlite3
```

#### Step 1: Define object shape via Zod, and specify defaults:

After importing zod (`import { z } from 'zod'`):
```ts
const zContact = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  created_at: z.number(),
  updated_at: z.number()
})
type ZContact = z.infer<typeof zContact>
```

Sepcify default values for all props. (These only affect migrations.)
```ts
const defaultContactRow: ZContact = {
  id: '',
  name: '',
  email: '',
  phone: '',
  created_at: 0,
  updated_at: 0
}
```

#### Step 2: Create a model factory, and a model:

After a couple of quick imports:
```ts
import { Sequelize, DataTypes } from 'sequelize'
import { sqlduck } from './index-sqlduck'
```

Create a model factory:
```ts
const modelFactory = sqlduck.modelFactory({
  sequelize: new Sequelize('sqlite::memory:'),
  DTypes: DataTypes
})
```

And then define your first model:
```ts
const contactModel = modelFactory.defineModel({
  zRowSchema: zContact,
  tableName: 'contact',
  defaultRow: defaultContactRow
})
```
We've created a single model here, but you can create multiple models using the same factory.

#### Step 3: Create/migrate DB table, and perform CRUD operations:
```ts
const main = async function () {
    // Create/migrate the 'contact' table in the database, non-desctructively:
    await contactModel.autoMigrate()

    // Create a contact object:
    await contactModel.create({
        id: 'testing123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '',
        created_at: Date.now(),
        updated_at: 0,
    })

    // Read the contact by id:
    const contact = await contactModel.findOne({ where: { id: 'testing123' } })
    console.log('Contact created: ', contact)

    // Update the contact in memory and then persist it to DB:
    const updatedContact = {
        ...contact, phone: '555 555 0123', updated_at: Date.now()
    }
    await contactModel.replace(updatedContact)
    console.log('Contact updated: ', updatedContact)

    // Delete the contact:
    await contactModel.deleteById(contact.id)
    console.log('Contact deleted.')
}
main()
```

In addition to `.findOne()`, there's `.findAll()` for finding multiple records.
