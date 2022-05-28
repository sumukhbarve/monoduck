import path from 'path'
import fs from 'fs'
import { Sequelize, DataTypes } from 'sequelize'
import { sqlduck } from './index-sqlduck'
import { z } from 'zod'
import { _ } from './indeps-sqlduck'

//
// Prelims: ////////////////////////////////////////////////////////////////////
//

// Constants:
const DB_FILEPATH = `${path.join(__dirname, 'testing.sqlite.db')}`
const DATABASE_URL = `sqlite:${DB_FILEPATH}`

// Typings:
const zContact = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  created_at: z.number(),
  updated_at: z.number()
})
type ZContact = z.infer<typeof zContact>
const defaultContactRow: ZContact = {
  id: '',
  name: '',
  email: '',
  phone: '',
  created_at: 0,
  updated_at: 0
}

// Helpers:
const generateId = (): string => String(Date.now() + Math.random())
const buildContact = function (name: string): ZContact {
  return {
    id: generateId(),
    name: name,
    email: '',
    phone: '',
    created_at: Date.now(),
    updated_at: 0
  }
}

//
// Setup: //////////////////////////////////////////////////////////////////////
//
const modelFactory = sqlduck.modelFactory({
  sequelize: new Sequelize(DATABASE_URL, { logging: false }),
  DTypes: DataTypes
})

const contactModel = modelFactory.defineModel({
  defaultRow: defaultContactRow,
  tableName: 'contact',
  zRowSchema: zContact
})

beforeAll(async function () {
  // console.log('Starting auto-migration ...')
  await modelFactory.autoMigrate()
  // console.log('Auto-migration complete.')
})

//
// Testing: ////////////////////////////////////////////////////////////////////
//
test('CRUD single record', async function () {
  const johnDoe = buildContact('John Doe')
  // Create:
  const didCreate = await contactModel.create(johnDoe)
  expect(didCreate).toBe(true)
  // Read created:
  const readJohnDoe = await contactModel.findOne({ where: { id: johnDoe.id } })
  expect(readJohnDoe !== johnDoe).toBe(true) // Not the same object
  expect(readJohnDoe).toStrictEqual(johnDoe) // But the same value
  expect(readJohnDoe?.name).toBe('John Doe')
  // Update:
  const updatedJohnDoe: ZContact = {
    ...johnDoe,
    email: 'john.doe@example.com',
    updated_at: Date.now()
  }
  await contactModel.replace(updatedJohnDoe)
  // Read updated:
  const readUpdatedJohn = await contactModel.findOne({ where: { id: johnDoe.id } })
  expect(readUpdatedJohn !== updatedJohnDoe).toBe(true) // not same object
  expect(readUpdatedJohn).toStrictEqual(updatedJohnDoe) // but same value
  expect(readUpdatedJohn?.email).toBe('john.doe@example.com')
  expect(readUpdatedJohn?.updated_at).toBeGreaterThan(updatedJohnDoe.created_at)
  // Delete:
  await contactModel.deleteById(johnDoe.id)
  // Read deleted:
  const readDeletedJohn = await contactModel.findOne({ where: { id: johnDoe.id } })
  expect(readDeletedJohn).toBe(null)
})

test('CRUD multiple record', async function () {
  const contacts = _.map(['Curly', 'Larry', 'Moe'], name => buildContact(name))
  // Create:
  for (const contact of contacts) {
    const didCreate = await contactModel.create(contact)
    expect(didCreate).toBe(true)
  }
  // Read created:
  const readContacts = await contactModel.findAll()
  expect(readContacts !== contacts).toBe(true) // Not the same array
  expect(readContacts).toStrictEqual(contacts) // But the same value
  // Update:
  const updatedContacts = _.map(contacts, function (contact) {
    return { ...contact, email: `${contact.name}@example.com` }
  })
  for (const uContact of updatedContacts) {
    await contactModel.replace(uContact)
  }
  // Read updated:
  const ruContacts = await contactModel.findAll()
  expect(ruContacts !== updatedContacts).toBe(true) // not same array
  expect(ruContacts).toStrictEqual(updatedContacts) // but same value
  // Delete:
  for (const uContact of updatedContacts) {
    await contactModel.deleteById(uContact.id)
  }
  // Read deleted:
  const deletedContacts = await contactModel.findAll()
  expect(deletedContacts).toStrictEqual([])
})

//
// Teardown: ///////////////////////////////////////////////////////////////////
//
afterAll(function () {
  fs.unlinkSync(DB_FILEPATH)
})
