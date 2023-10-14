const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

import Ticketiq from 'App/Models/Ticketiq';
import TicketIQticket from 'App/Models/TicketIQticket';

import { DateTime } from 'luxon';


class TicketiqscrapersController {

  async scrape({ response, request }) {
    try {
      const browser = await puppeteer.launch();

      // Open a new page
      const page = await browser.newPage();
      // Navigate to the URL
      await page.goto('https://www.ticketiq.com/nba-tickets/');

      // Wait for the content to load (you may need to adjust the selector and wait time)
      await page.waitForSelector('.contentItem', { timeout: 5000 });

      // Extract titles and href links
      const Events = await page.evaluate(() => {
        const contentItems = Array.from(document.querySelectorAll('.contentItem'));
        return contentItems.map(item => {
          let link = item.getAttribute('href');
          // Check if href is relative, if so, prepend the base URL
          if (link && !link.startsWith('http')) {
            link = 'https://www.ticketiq.com' + link;
          }
          return {
            Team: item.textContent.trim(), // Use trim() to remove extra whitespaces
            link: link
          };
        });
      });

      // Create an instance of the Ticketiq model for each event and save it to the database
      const savedEvents = [];

      for (const Event of Events) {
        // Check if the event already exists in the database
        const existingEvent = await Ticketiq.findBy('team', Event.Team);
        const ticketiq = new Ticketiq();

        if (!existingEvent) {
          ticketiq.team = Event.Team;
          ticketiq.link = Event.link;
          await ticketiq.save();

          savedEvents.push(ticketiq);
        }
      }

      console.log("data stored in database")
      // Close the browser
      await browser.close();

      // Print the extracted data


      // Send the data as a JSON response
      return response.status(200).json(savedEvents);
    } catch (error) {
      console.error('Error:', error);
      return response.status(500).json({ error: 'An error occurred while scraping data.' });
    }
  }

  ///////////////////////////////////////////////////////
  //////////////////////////////////////////////////////

  async tickets_ts({ response }) {
    try {
      const browser = await puppeteer.launch({
        //headless: false,
        timeout: 30000
      });

      const page = await browser.newPage();

      const link = await Ticketiq.query().where('scraped', false).firstOrFail();

      const scrapedData = [] as any;

      const url = link.link

      // Replace 'your_url_here' with the actual URL of the page containing the data
      await page.goto(url, {
        waitUntil: 'domcontentloaded'
      });

      // Function to click the "Load More" button


      const clickLoadMoreButton = async () => {
        const loadMoreButton = await page.$('#showMoreLocal');
        if (loadMoreButton) {
          await loadMoreButton.click();
          // Wait for some time for the new data to load (you can adjust the timeout as needed)
          await page.waitForTimeout(4000);
          return true;
        }
        return false;
      };

      const eventData = [] as any;

      // Loop to keep clicking the "Load More" button until it's no longer available
      while (true) {
        const newEventData = await page.evaluate(() => {

          const eventElements = Array.from(document.querySelectorAll('.buyButton'));
          const url = 'https://www.ticketiq.com'
          const eventDataList = eventElements.map((eventElement) => {

            let link = eventElement.getAttribute('href');
            if (link && !link.startsWith('http')) {
              // Concatenate the base URL with the relative link
              link = url + link;

              const dateContainer = eventElement.querySelector('.dateContainer');
              const eventDisplay = eventElement.querySelector('.eventDisplay');
              const cityState = eventElement.querySelector('.cityState');
              const minPrice = eventElement.querySelector('.minPrice');

              return {
                link: link,
                date: dateContainer.innerText.trim(),
                eventName: eventDisplay.innerText.trim(),
                location: cityState.innerText.trim(),
                minPrice: minPrice.innerText.trim(),
              };

            });
          // console.log(eventDataList);
          return eventDataList;
        });
        eventData.push(...newEventData);
        // Click the "Load More" button, and if it's not available, break the loop
        if (!(await clickLoadMoreButton())) {
          break;
        }

        // return response.status(200).json(eventData);

        //console.log(eventData);


      }

      //add delay

      scrapedData.push({ url, eventData })


      link.scraped = true
      await link.save()
      // await browser.close();


      for (const event of eventData) {
        console.log(event)
        // const existingEvent = await TicketIQticket.findByOrFail('link', event.link);

        // if (!existingEvent) {
        //   const ticket = new TicketIQticket();
        //   ticket.link = event.link,
        //     ticket.date = event.date,
        //     ticket.event = event.eventName,
        //     ticket.location = event.location,
        //     ticket.price = event.minPrice

        //   await ticket.save();
        //   savedEvents.push(ticket);

        // }
        try {
          await TicketIQticket.updateOrCreate({ link: event.link }, {
            link: event.link,
            date: event.date,
            location: event.location,
            price: event.minPrice,
            name: event.eventName,
            ticketiqId: link.id
          })
        }
        catch (e) {
          throw new Error(e)
        }
      }

      await browser.close();
      // Send the data as a JSON response
      return response.status(200).json(scrapedData);

    } catch (error) {
      console.error('Error:', error);
      return response.status(500).json({ error: 'An error occurred while scraping data.' });
    }

  }

  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  async tickets({ response }) {
    try {
      const browser = await puppeteer.launch({
        timeout: 0
      });

      const page = await browser.newPage();

      const links = await Ticketiq.all();

      const scrapedData = [];

      for (const link of links) {
        const url = link.link;

        // Replace 'your_url_here' with the actual URL of the page containing the data
        await page.goto(url);

        // Function to click the "Load More" button

        const clickLoadMoreButton = async () => {
          const loadMoreButton = await page.$('#showMoreLocal');
          if (loadMoreButton) {
            await loadMoreButton.click();
            // Wait for some time for the new data to load (you can adjust the timeout as needed)
            await page.waitForTimeout(4000);
            return true;
          }
          return false;
        };

        const eventData = [];

        // Loop to keep clicking the "Load More" button until it's no longer available
        while (true) {
          const newEventData = await page.evaluate(() => {
            const eventElements = Array.from(document.querySelectorAll('.buyButton'));

            const eventDataList = eventElements.map((eventElement) => {
              const link = eventElement.getAttribute('href');
              const dateContainer = eventElement.querySelector('.dateContainer');
              const eventDisplay = eventElement.querySelector('.eventDisplay');
              const cityState = eventElement.querySelector('.cityState');
              const minPrice = eventElement.querySelector('.minPrice');

              return {
                link: link,
                date: dateContainer.innerText.trim(),
                eventName: eventDisplay.innerText.trim(),
                location: cityState.innerText.trim(),
                minPrice: minPrice.innerText.trim(),
              };
            });

            return eventDataList;
          });
          eventData.push(...newEventData);
          // Click the "Load More" button, and if it's not available, break the loop
          if (!(await clickLoadMoreButton())) {
            break;
          }
          // Add a delay after each loop iteration (adjust the timeout as needed)
          console.log(eventData)
          await page.waitForTimeout(6000);
        }

        scrapedData.push({ url, eventData });
      }

      await browser.close();

      // Send the data as a JSON response
      return response.status(200).json(scrapedData);
    } catch (error) {
      console.error('Error:', error);
      return response.status(500).json({ error: 'An error occurred while scraping data.' });
    }
  }

  //////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////

  async test({ response }) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // Replace 'your_url_here' with the actual URL of the page containing the data
      await page.goto('https://www.ticketiq.com/nba/atlanta-hawks-tickets/ ');

      // Function to click the "Load More" button
      const clickLoadMoreButton = async () => {
        const loadMoreButton = await page.$('#showMoreLocal');
        if (loadMoreButton) {
          await loadMoreButton.click();
          // Wait for some time for the new data to load (you can adjust the timeout as needed)
          await page.waitForTimeout(4000);
          return true;
        }
        return false;
      };

      const eventData = [];

      // Loop to keep clicking the "Load More" button until it's no longer available
      while (true) {
        const newEventData = await page.evaluate(() => {
          const eventElements = Array.from(document.querySelectorAll('.buyButton'));

          const eventDataList = eventElements.map((eventElement) => {
            const link = eventElement.getAttribute('href');
            const dateContainer = eventElement.querySelector('.dateContainer');
            const eventDisplay = eventElement.querySelector('.eventDisplay');
            const cityState = eventElement.querySelector('.cityState');
            const minPrice = eventElement.querySelector('.minPrice');

            return {
              link: link,
              date: dateContainer.innerText.trim(),
              eventName: eventDisplay.innerText.trim(),
              location: cityState.innerText.trim(),
              minPrice: minPrice.innerText.trim(),
            };
          });

          return eventDataList;
        });

        eventData.push(...newEventData);

        // Click the "Load More" button, and if it's not available, break the loop
        if (!(await clickLoadMoreButton())) {
          break;
        }
      }

      await browser.close();

      // Send the data as a JSON response
      return response.status(200).json(eventData);
    } catch (error) {
      console.error('Error:', error);
      return response.status(500).json({ error: 'An error occurred while scraping data.' });
    }
  }



  public async gameSub({ response }) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Replace with the URL of the page you want to scrape
    const url = 'https://www.ticketiq.com/';
    await page.goto(url);

    // Wait for the page to load (you can adjust the timeout as needed)
    await page.waitForSelector('.mmFixedBtn');

    // Get the links and text content
    const scrapedData = await page.evaluate(() => {
      const data = [];
      const mmFixedBtns = document.querySelectorAll('.mmFixedBtn');

      mmFixedBtns.forEach((btn) => {
        const textContent = btn.querySelector('.mmFixedBtnText').textContent;
        const links = Array.from(btn.querySelectorAll('.contentItem')).map((link) => ({
          text: link.textContent,
          href: link.getAttribute('href'),
        }));

        data.push({ textContent, links });
      });

      return data;
    });

    // Close the browser
    await browser.close();

    // Output the scraped data
    console.log(scrapedData);

    return response.status(200).json(scrapedData);
  }

}

module.exports = TicketiqscrapersController;