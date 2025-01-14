# NBA Ticket Scraper
This project provides an API for scraping NBA ticket data from multiple ticket platforms including TicketIQ, Gametime, and ScoreBig. The API allows users to retrieve team and ticket details, as well as game information through different controllers.

The project uses Puppeteer for web scraping and AdonisJS for managing the backend and API routes.

## Features
Scrape ticket data from different sources: TicketIQ, Gametime, and ScoreBig.
Extract details such as team information, game schedules, ticket prices, and venues.
Provide an API for accessing the scraped data in JSON format.

## Endpoints
### 1. TicketIQ Scrapers
```
GET /ticketiqsubteams: Scrape subteam information for TicketIQ.
GET /ticketiqtickets: Scrape ticket information for games from TicketIQ.
GET /ticketiqgamesubs: Scrape game subcategories for TicketIQ.
```
2. Gametime Scrapers
```
GET /gametimeteams: Scrape team information from Gametime.
GET /gametimetickets: Scrape ticket information for NBA games from Gametime.
```
### 3. ScoreBig Scrapers
```
GET /scorebigteams: Scrape team information from ScoreBig.
GET /scorebigticketlinks: Scrape ticket links from ScoreBig.
GET /tst: Scrape additional ticket links from ScoreBig.
```

## Sample JSON Responses
### TicketIQ Example Response:
```
json
{
  "ticketData": [
    {
      "link": "https://ticketiq.com/nba-boston-celtics-tickets/performers/nba_bos",
      "day": "Monday",
      "date": "2025-04-01",
      "time": "7:00 PM",
      "name": "Boston Celtics vs. Los Angeles Lakers",
      "venue": "TD Garden",
      "price": "$50"
    },
    {
      "link": "https://ticketiq.com/nba-chicago-bulls-tickets/performers/nba_chi",
      "day": "Tuesday",
      "date": "2025-04-02",
      "time": "1:00 PM",
      "name": "Chicago Bulls vs. Miami Heat",
      "venue": "United Center",
      "price": "$40"
    }
  ]
}
```
### Gametime Example Response:
```
json
{
  "scrapedData": [
    {
      "url": "https://gametime.co/nba-tickets",
      "ticketData": [
        {
          "link": "https://gametime.co/boston-celtics-tickets/performers/nba_bos",
          "day": "Wednesday",
          "date": "2025-04-05",
          "time": "7:30 PM",
          "name": "Boston Celtics vs. Toronto Raptors",
          "venue": "TD Garden",
          "price": "$55"
        },
        {
          "link": "https://gametime.co/los-angeles-lakers-tickets/performers/nba_lal",
          "day": "Thursday",
          "date": "2025-04-06",
          "time": "8:00 PM",
          "name": "Los Angeles Lakers vs. Golden State Warriors",
          "venue": "Staples Center",
          "price": "$75"
        }
      ]
    }
  ]
}
```
### ScoreBig Example Response:
```
json
{
  "scorebigData": [
    {
      "link": "https://www.scorebig.com/boston-celtics-tickets",
      "team": "Boston Celtics",
      "date": "2025-04-01",
      "venue": "TD Garden",
      "price": "$45"
    },
    {
      "link": "https://www.scorebig.com/chicago-bulls-tickets",
      "team": "Chicago Bulls",
      "date": "2025-04-02",
      "venue": "United Center",
      "price": "$40"
    }
  ]
}
```
## Installation
#### Prerequisites
##### Ensure you have the following installed:
Node.js and npm
AdonisJS (backend framework)
Puppeteer for web scraping
A database like MySQL or PostgreSQL for storing the scraped data.
#### Steps to Install
##### Clone the repository:
``git clone https://github.com/yourusername/nba-ticket-scraper.git``

``cd nba-ticket-scraper``

##### Install dependencies:
``npm install``

#### Configure your database in config/database.ts.

##### Run migrations to set up the database schema:
``node ace migration:run``

##### Start the server:
``node ace serve --watch``

### Usage
You can use the API by calling the relevant endpoints to retrieve scraped ticket data.

#### Example API Calls
```
Scrape Ticket Data for TicketIQ:
curl http://localhost:3333/ticketiqtickets

Scrape Ticket Data for Gametime:
curl http://localhost:3333/gametimetickets

Scrape Ticket Data for ScoreBig:
curl http://localhost:3333/scorebigticketlinks
```
#### Database Models
Ticket Data Models
##### Fields:
```
link: The ticket link for a specific game.
day: The day of the game.
date: The date of the game.
time: The time of the game.
name: The name of the game (e.g., "Boston Celtics vs. Los Angeles Lakers").
venue: The venue where the game is played.
price: The price of the ticket.
```
