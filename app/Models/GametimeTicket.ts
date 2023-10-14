//import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class GametimeTicket extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public link: string

  @column()
  public ticketiqId: number

  @column()
  public date: string

  @column()
  public time: string

  @column()
  public game: string

  @column()
  public venue: string

  @column()
  public price: string

  /* @column.dateTime({ autoCreate: true })
   public createdAt: DateTime
 
   @column.dateTime({ autoCreate: true, autoUpdate: true })
   public updatedAt: DateTime
   */
}
