//import Database from '@ioc:Adonis/Lucid/Database'
const { use } = require('@adonisjs/core');

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

//const Gametime = use('App/Models/Gametime'); // Import your Gametime model
//import Gamatime from 'app/Models/Gametime';
import Gametime from 'App/Models/Gametime';
import GametimeTicket from 'App/Models/GametimeTicket';

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

class GametimesController {


  public async test2({ response, request }: HttpContextContract) {
    try {
      const browser = await puppeteer.launch({
        headless: true,
      });
      const page = (await browser.pages())[0];
      // await page.setViewport({ width: 800, height: 600 });

      await page.goto('https://gametime.co/mlb-baseball-tickets');

      const data = await page.evaluate(() => {
        const results = [];
        //#content > div > div > div.app-main-content__wrapper > main > div.Gw9Hk164B35zyc78n1aAv > div:nth-child(2) > section
        const containers = Array.from(document.querySelectorAll('#content > div > div > div.app-main-content__wrapper > main > div.IkVAeblxWXmrllS7Rq_0V > div > div.svuYtiwNQskgRHDMLl_l-'));

        containers.forEach(container => {
          const mainTitleElement = container.querySelector('#content > div > div > div.app-main-content__wrapper > main > div.IkVAeblxWXmrllS7Rq_0V > div > div.svuYtiwNQskgRHDMLl_l- > div');
          if (mainTitleElement) {
            const mainTitle = mainTitleElement ? mainTitleElement.innerText.trim() : '';

            const subtitleElements = container.querySelectorAll('#content > div > div > div.app-main-content__wrapper > main > div.IkVAeblxWXmrllS7Rq_0V > div > div.svuYtiwNQskgRHDMLl_l- > div > a');
            const Teams = [];

            subtitleElements.forEach(subtitleElement => {
              const subtitleDiv = subtitleElement.querySelector('#content > div > div > div.app-main-content__wrapper > main > div.IkVAeblxWXmrllS7Rq_0V > div > div.svuYtiwNQskgRHDMLl_l- > div:nth-child(n) > a > div');
              if (subtitleDiv) {
                const Team = subtitleDiv ? subtitleDiv.innerText.trim() : '';
                let link = subtitleElement.getAttribute('href');
                if (link && !link.startsWith('http')) {
                  link = 'https://gametime.co' + link;
                }
                //https://gametime.co/boston-celtics-tickets/performers/nbabos
                Teams.push({ Team, link });
              }
            });

            results.push({ Teams });
          }
        });

        return results;
      });

      const savedTeams = [];

      // Store the data in the database
      for (const result of data) {

        for (const team of result.Teams) {
          const existingTeam = await Gametime.findBy('team', team.Team)
          const gametime = await Gametime;
          if (!existingTeam) {
            await gametime.create({
              team: team.Team,
              link: team.link,
            });
            savedTeams.push(gametime);
          }
        }
      }
      console.log("data stored in the database");

      await browser.close();

      return response.status(200).json(savedTeams);
    } catch (error) {
      console.error('Error:', error);
      return response.status(500).json({ error: 'An error occurred while scraping data.' });
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////

  public async tickets({ response, request }: HttpContextContract) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      const link = await Gametime.query().where('scraped', false).firstOrFail();

      const scrapedData = [] as any;

      const url = link.link;

      // Navigate to the website
      await page.goto(url, {
        waitUntil: 'domcontentloaded'
      }); // Replace with the actual URL
      //#content > div > div > div.app-main-content__wrapper > main > div.Gw9Hk164B35zyc78n1aAv > div:nth-child(2) > section
      const clickLoadMoreButton = async () => {
        //#content > div > div > div.app-main-content__wrapper > main > div.Gw9Hk164B35zyc78n1aAv > div:nth-child(2) > section > div > button
        const loadMoreButton = await page.$('main > div.Gw9Hk164B35zyc78n1aAv > div > section > div > button');
        if (loadMoreButton) {
          await loadMoreButton.click();
          // Wait for some time for the new data to load (you can adjust the timeout as needed)
          await page.waitForTimeout(4000);
          return true;
        }
        return false;
      };

      const ticketData = [] as any

      // Wait for the data to load (you may need to adjust the selector and wait time)
      await page.waitForSelector('main > div.Gw9Hk164B35zyc78n1aAv > div > section');
      await page.waitForTimeout(2000); // Adjust the wait time as needed
      // Extract the data

      while (true) {
        const data = await page.evaluate(() => {

          const ticketElements = Array.from(document.querySelectorAll('main > div.Gw9Hk164B35zyc78n1aAv '));
          //#content > div > div > div.app-main-content__wrapper > main > div.Gw9Hk164B35zyc78n1aAv > div:nth-child(2) > section
          const ticket = ticketElements.map((ticketdata) => {

            const day = ticketdata.querySelector(
              ' div > section > div > div > div.ZE1DXNCVIxWmgQjnw_oWy > div.mVD7uIlVVAWZggZYnr7FR'
            )?.textContent || '';

            const date = ticketdata.querySelector(
              ' div > section > a > div > div > div.ZE1DXNCVIxWmgQjnw_oWy > div._1ysyENgK_zeITUBkyqcnZZ'
            )?.textContent || '';

            const link = ticketdata.querySelector('div > section> a').getAttribute('href') || '';

            const time = ticketdata.querySelector(' div > section > a > div > div > div._1G7MD7SHpB5E3k7xDXXOi- > div.mVD7uIlVVAWZggZYnr7FR > div > span ')?.textContent || '';
            const game = ticketdata.querySelector(' div > section > a > div > div > div._1G7MD7SHpB5E3k7xDXXOi- > div._1ysyENgK_zeITUBkyqcnZZ')?.textContent || '';

            const venue = ticketdata.querySelector(
              ' div > section > a > div > div > div._1G7MD7SHpB5E3k7xDXXOi- > div.mVD7uIlVVAWZggZYnr7FR > div > span:nth-child(3)'
            )?.textContent || '';

            const price = ticketdata.querySelector(' div > section > a > div > div > div._1G7MD7SHpB5E3k7xDXXOi- > div._2ca-mVuLkbb6Y_QOP6482K')?.textContent || '';

            return {
              link: link,
              day: day,
              date: date,
              time: time,
              name: game,
              venue: venue,
              price: price,
            }
          });

          return ticket;

        });
        ticketData.push(...data)

        //click load more button 
        if (!(await clickLoadMoreButton())) {
          break;
        }

      }

      scrapedData.push({ url, ticketData })


      link.scraped = true
      await link.save()
      //

      for (const ticket of ticketData) {
        console.log(ticket)
        try {
          await GametimeTicket.updateOrCreate({ link: ticket.link }, {
            link: ticket.link,
            date: ticket.date,
            time: ticket.time,
            game: ticket.name,
            venue: ticket.venue,
            price: ticket.price,
            ticketiqId: link.id
          })
        }
        catch (e) {
          throw new Error(e)
        }
      }

      await browser.close();

      return response.status(200).json(scrapedData);

    } catch (error) {
      console.error('Error:', error);
      return response.status(500).json({ error: 'An error occurred while scraping data.' });
    }
  }





}


module.exports = GametimesController;

/*
const gametime = await Gametime;
    // Store the data in the database
    for (const result of data) {
      for (const team of result.Teams) {
        await gametime.create({
          Team: team.Team,
          link: team.link,
        });
      }
    }
    console.log("data stored in the database");
    */
