/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

//Route.get('test', 'TicketiqscrapersController.tickets_ts')

//ticketIQ
Route.get('ticketiqsubteams', 'TicketiqscrapersController.scrape')
Route.get('ticketiqtickets', 'TicketiqscrapersController.tickets')
Route.get('ticketiqgamesubs', 'TicketiqscrapersController.gameSub')

//gametime
Route.get('gametimeteams', 'GametimesController.test2')
Route.get('gametimetickets', 'GametimesController.tickets')
//Route.get('test', 'GametimesController.tickets_test')

//scorebig
Route.get('scorebigteams', 'ScorebigsController.teams')
Route.get('scorebigticketlinks', 'ScorebigsController.tickets_links')
Route.get('tst', 'ScorebigsController.tickets_links2')


//correctscore scraper
Route.get('correctscore', 'CorrectScoresController.index')
