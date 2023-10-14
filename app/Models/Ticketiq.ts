//import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Ticketiq extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public team: string

  @column()
  public link: string

  @column()
  public scraped: boolean

}
