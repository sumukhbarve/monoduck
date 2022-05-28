import type {
  Sequelize, DataTypes, FindOptions, ModelStatic, Model
} from 'sequelize'
import type { ZodSchema } from 'zod'
import { _ } from './indeps-sqlduck'

// Base row. Rows must have a string `.id` property.
type BRow = Record<string, string | number> & { id: string } // BRow ~ Base Row

// DuckModel: Model object created by sqlduck.model.
// SequelizeModel: Model object created (internally) via sequelize.define.
interface DuckModel<ZRow extends BRow> {
  create: (row: ZRow) => Promise<boolean>
  count: (options?: FindOptions) => Promise<number>
  findOne: (options: FindOptions) => Promise<ZRow | null>
  findAll: (options?: FindOptions) => Promise<ZRow[]>
  replace: (updatedRow: ZRow) => Promise<void>
  deleteById: (id: string) => Promise<void>
  authenticate: () => Promise<void>
  autoMigrate: () => Promise<void>
  SequelizeModel: ModelStatic<Model<any, any>>
}

// Params related to Sequelize, i.e. sequelize dependency injection
interface PluginParams {
  sequelize: Sequelize
  DTypes: typeof DataTypes
}
// Params related to Zod/Row/Table.
interface TableParams<ZRow extends BRow> {
  tableName: string
  defaultRow: ZRow
  zRowSchema: ZodSchema<ZRow>
}
type ModelParams<ZRow extends BRow> = PluginParams & TableParams<ZRow>

const defineModel = function<ZRow extends BRow> (
  params: ModelParams<ZRow>
): DuckModel<ZRow> {
  const { sequelize, DTypes, tableName, defaultRow, zRowSchema } = params
  const sequelizeModelAttrs = _.mapObject(defaultRow, function (val, key) {
    return {
      type: typeof val === 'string' ? DTypes.TEXT : DTypes.DOUBLE,
      allowNull: false,
      primaryKey: key === 'id',
      defaultValue: val
    }
  })
  const sequelizeModelOptions = { tableName, timestamps: false }
  const SequelizeModel = sequelize.define(
    tableName,
    sequelizeModelAttrs,
    sequelizeModelOptions
  )

  // CRUD operations:
  const create = async function (row: ZRow): Promise<boolean> {
    await SequelizeModel.create(row)
    return true
  }

  const count = async function (options?: FindOptions): Promise<number> {
    return await SequelizeModel.count(options)
  }

  const findOne = async function (options: FindOptions): Promise<ZRow | null> {
    const rawOptions = { ...options, raw: true }
    const row = await SequelizeModel.findOne(rawOptions)
    return _.bool(row) ? zRowSchema.parse(row) : null
  }

  const findAll = async function (options?: FindOptions): Promise<ZRow[]> {
    const rawOptions = { ...(options ?? {}), raw: true }
    const rows = await SequelizeModel.findAll(rawOptions)
    return _.map(rows, row => zRowSchema.parse(row))
  }

  const replace = async function (updatedRow: ZRow): Promise<void> {
    await SequelizeModel.update(updatedRow, { where: { id: updatedRow.id } })
  }

  const deleteById = async function (id: string): Promise<void> {
    await SequelizeModel.destroy({ where: { id: id } })
  }

  // Connection & Migration:
  const authenticate = async function (): Promise<void> {
    await sequelize.authenticate()
  }
  const autoMigrate = async function (): Promise<void> {
    await SequelizeModel.sync({ alter: { drop: false } })
  }

  // model() returns:
  return {
    create,
    count,
    findOne,
    findAll,
    replace,
    deleteById,
    authenticate,
    autoMigrate,
    SequelizeModel
  }
}

type BoundDefineFn =
  <ZRow extends BRow>(p: TableParams<ZRow>) => DuckModel<ZRow>

const makeModelDefiner = function (pluginParams: PluginParams): BoundDefineFn {
  const boundDefineFn = function <ZRow extends BRow>(
    tableParams: TableParams<ZRow>
  ): DuckModel<ZRow> {
    const params: ModelParams<ZRow> = { ...pluginParams, ...tableParams }
    return defineModel(params)
  }
  return boundDefineFn
}

interface ModelFactory {
  authenticate: () => Promise<void>
  autoMigrate: () => Promise<void>
  defineModel: BoundDefineFn
}
const modelFactory = function (pluginParams: PluginParams): ModelFactory {
  const { sequelize } = pluginParams
  const boundDefineFn = makeModelDefiner(pluginParams)
  // Connection & Migration:
  const authenticate = async function (): Promise<void> {
    await sequelize.authenticate()
  }
  const autoMigrate = async function (): Promise<void> {
    await sequelize.sync({ alter: { drop: false } })
  }
  return { authenticate, autoMigrate, defineModel: boundDefineFn }
}

export type { DuckModel, BoundDefineFn }
export const sqlduck = { defineModel, makeModelDefiner, modelFactory }
