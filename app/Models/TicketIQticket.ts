//import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class TicketIQticket extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public ticketiqId: number

  @column()
  public link: string

  @column()
  public date: string

  @column()
  public event: string

  @column()
  public location: string

  @column()
  public name: string

  @column()
  public price: string
}
